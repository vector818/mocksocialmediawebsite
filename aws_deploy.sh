#!/bin/bash
set -euo pipefail

# ============================================================
#  aws_deploy.sh - Creates an EC2 instance, assigns Elastic IP
#                  and installs Docker + Docker Compose
# ============================================================

# === CONFIGURATION (adjust to your needs) ===
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.micro}"
KEY_NAME="${KEY_NAME:-}"
SECURITY_GROUP="${SECURITY_GROUP:-}"
SUBNET_ID="${SUBNET_ID:-}"
ELASTIC_IP_ALLOC_ID="${ELASTIC_IP_ALLOC_ID:-}"
REGION="${AWS_REGION:-eu-central-1}"
INSTANCE_NAME="${INSTANCE_NAME:-docker-server}"
VOLUME_SIZE="${VOLUME_SIZE:-20}"
ARCH="${ARCH:-x86_64}"

# === VALIDATION ===
MISSING=()
[ -z "$KEY_NAME" ]            && MISSING+=("KEY_NAME")
[ -z "$SECURITY_GROUP" ]      && MISSING+=("SECURITY_GROUP")
[ -z "$ELASTIC_IP_ALLOC_ID" ] && MISSING+=("ELASTIC_IP_ALLOC_ID")

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "Missing environment variables:"
  for var in "${MISSING[@]}"; do
    echo "  - $var"
  done
  echo ""
  echo "Usage:"
  echo "  KEY_NAME=mykey SECURITY_GROUP=sg-xxx ELASTIC_IP_ALLOC_ID=eipalloc-xxx ./aws_deploy.sh"
  echo ""
  echo "Optional variables:"
  echo "  INSTANCE_TYPE       (default: t3.micro)"
  echo "  SUBNET_ID           (default: default subnet)"
  echo "  AWS_REGION          (default: eu-central-1)"
  echo "  INSTANCE_NAME       (default: docker-server)"
  echo "  VOLUME_SIZE         (default: 20 GB)"
  exit 1
fi

# === CHECK AWS CLI ===
if ! command -v aws &> /dev/null; then
  echo "Error: AWS CLI is not installed."
  echo "Install: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
  exit 1
fi

# === FETCH LATEST AMAZON LINUX 2023 AMI ===
echo "Looking for the latest Amazon Linux 2023 AMI ($ARCH) in region $REGION..."
AMI_ID=$(aws ec2 describe-images \
  --region "$REGION" \
  --owners amazon \
  --filters "Name=name,Values=al2023-ami-2023.*-${ARCH}" \
             "Name=state,Values=available" \
  --query 'Images | sort_by(@, &CreationDate) | [-1].ImageId' \
  --output text)

if [ -z "$AMI_ID" ] || [ "$AMI_ID" = "None" ]; then
  echo "Error: Could not find Amazon Linux 2023 AMI."
  exit 1
fi
echo "AMI: $AMI_ID"

# === USER DATA - Docker installation on startup ===
USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
yum update -y

# Git + htop
yum install -y git htop

# Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Docker Compose (V2 plugin) + Buildx
mkdir -p /usr/local/lib/docker/cli-plugins
COMPOSE_URL="https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)"
curl -L "$COMPOSE_URL" -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

BUILDX_ARCH=$(uname -m)
case "$BUILDX_ARCH" in
  x86_64)  BUILDX_ARCH="amd64" ;;
  aarch64) BUILDX_ARCH="arm64" ;;
esac
BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep '"tag_name"' | sed 's/.*"v\(.*\)".*/\1/')
curl -L "https://github.com/docker/buildx/releases/download/v${BUILDX_VERSION}/buildx-v${BUILDX_VERSION}.linux-${BUILDX_ARCH}" -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

echo "Setup complete (git, docker, docker-compose)" > /home/ec2-user/setup-done
chown ec2-user:ec2-user /home/ec2-user/setup-done
USERDATA
)

# === BUILD COMMAND ===
RUN_ARGS=(
  --region "$REGION"
  --image-id "$AMI_ID"
  --instance-type "$INSTANCE_TYPE"
  --key-name "$KEY_NAME"
  --security-group-ids "$SECURITY_GROUP"
  --block-device-mappings "[{\"DeviceName\":\"/dev/xvda\",\"Ebs\":{\"VolumeSize\":$VOLUME_SIZE,\"VolumeType\":\"gp3\"}}]"
  --user-data "$USER_DATA"
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$INSTANCE_NAME}]"
  --query 'Instances[0].InstanceId'
  --output text
)

if [ -n "$SUBNET_ID" ]; then
  RUN_ARGS+=(--subnet-id "$SUBNET_ID")
fi

# === CREATE INSTANCE ===
echo "Creating EC2 instance ($INSTANCE_TYPE)..."
INSTANCE_ID=$(aws ec2 run-instances "${RUN_ARGS[@]}")

if [ -z "$INSTANCE_ID" ]; then
  echo "Error: Failed to create instance."
  exit 1
fi
echo "Instance: $INSTANCE_ID"

# === WAIT FOR INSTANCE TO START ===
echo "Waiting for instance to start..."
aws ec2 wait instance-running \
  --region "$REGION" \
  --instance-ids "$INSTANCE_ID"
echo "Instance is running."

# === ASSIGN ELASTIC IP ===
echo "Assigning Elastic IP ($ELASTIC_IP_ALLOC_ID)..."
aws ec2 associate-address \
  --region "$REGION" \
  --instance-id "$INSTANCE_ID" \
  --allocation-id "$ELASTIC_IP_ALLOC_ID"

# === GET PUBLIC IP ===
PUBLIC_IP=$(aws ec2 describe-addresses \
  --region "$REGION" \
  --allocation-ids "$ELASTIC_IP_ALLOC_ID" \
  --query 'Addresses[0].PublicIp' \
  --output text)

echo ""
echo "============================================"
echo "  Instance ready!"
echo "============================================"
echo "  Instance ID:   $INSTANCE_ID"
echo "  Type:          $INSTANCE_TYPE"
echo "  Public IP:     $PUBLIC_IP"
echo "  Region:        $REGION"
echo "  Disk:          $VOLUME_SIZE GB (gp3)"
echo ""
echo "  SSH:"
echo "    ssh -i \"$KEY_NAME.pem\" ec2-user@$PUBLIC_IP"
echo ""
echo "  Docker is installing in the background (~1-2 min)."
echo "  Check status:"
echo "    ssh -i \"$KEY_NAME.pem\" ec2-user@$PUBLIC_IP 'cat ~/setup-done'"
echo "============================================"
