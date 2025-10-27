import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import useStyles from '../../../../style';
import Feed from './Feed/Feed';
import { Navigate } from 'react-router-dom';
import "./Facebook.css";
import {
  getFacebookPostsCount,
  clearFacebookState
} from '../../../../../actions/socialMedia';
import { updateFlowActiveState } from '../../../../../actions/flowState';
import { Button, Container } from '@material-ui/core';
import StoryCreate from "./Feed/StoryCreate/StoryCreate";
import { IconChevronRight } from '@tabler/icons-react';
import { WINDOW_GLOBAL } from '../../../../../constants';
import Progress from '../../../../Common/Progress';

const Facebook = ({ data }) => {
  const { isLoggedInUser, translations, languageName } = useSelector(state => state.userAuth);
  const totalPostCount = useSelector(state => state.socialMedia.totalPostCount);
  const isFeedLoading = useSelector(state => state.socialMedia.isLoading);
  const totalPostIds = useSelector(state => state.socialMedia.totalPostIds);
  const isFeedFinished = useSelector(state => state.socialMedia.finish);

  const dispatch = useDispatch();
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialFetchError, setHasInitialFetchError] = useState(false);

  const fetch = async () => {
    setIsLoading(true);
    setHasInitialFetchError(false);
    dispatch(clearFacebookState());
    // fetch all facebook Ids and their counts
    const getRequest = {
      templateId: data.templateId,
      pageId: data._id,
      platform: data.type,
      order: data.pageDataOrder,
      language: languageName,
    };
    try {
      await dispatch(getFacebookPostsCount(getRequest));
    } catch (error) {
      // errors are surfaced via snackbar in the action creator
      setHasInitialFetchError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedInUser) return <Navigate to="/" />;
    fetch();
    window.onbeforeunload = function() {
      return WINDOW_GLOBAL.RELOAD_ALERT_MESSAGE;
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateFlowActiveState());
  };

  const canShowNextButton =
    !isLoading &&
    !isFeedLoading &&
    (hasInitialFetchError || isFeedFinished || (totalPostIds && totalPostIds.length === 0));

  return (
    <>
      <Container component="main" maxWidth="sm" className="facebookCard">
        <StoryCreate />

        <div className="facebookMainBody">
          {totalPostCount && totalPostCount > 0 ? 
            <Feed omitInteractionBar={data?.omitInteractionBar || false}/> 
          : <p>No Posts Exists!</p>}
        </div>

        <div className="fbNextBotton">
          {canShowNextButton && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: '12px' }}
              onClick={handleSubmit}
              className={classes.submit}
              endIcon={<IconChevronRight />}
            >
              {translations?.next || "NEXT"}
            </Button>
          )}
        </div>
      </Container>
    </>
  )
};

export default Facebook;
