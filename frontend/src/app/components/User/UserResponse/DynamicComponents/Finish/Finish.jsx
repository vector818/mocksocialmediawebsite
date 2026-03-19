import { getUserFinishDetails } from '../../../../../services/finish-service';
import { useEffect, useState } from "react";
import { Button, Link } from '@material-ui/core';
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from 'react-router-dom';
import useStyles from '../../../../style';
import "./Finish.css";
import { updateFlowActiveState } from '../../../../../actions/flowState';
import { updateUserMain } from '../../../../../actions/user';
import { userLogout } from '../../../../../actions/userAuth';
import { trackPageMetaData } from '../../../../../services/user-tracking-service';
import { getCurrentUTCTime } from '../../../../../utils';
import { IconChevronRight } from '@tabler/icons-react';
import { USER_TRANSLATIONS_DEFAULT, WINDOW_GLOBAL } from '../../../../../constants';
import Progress from '../../../../Common/Progress';

const Finish = ({ data }) => {
  const [finishObj, setFinishObj] = useState(null);
  const dispatch = useDispatch();
  const classes = useStyles();
  const { isLoggedInUser, translations } = useSelector(state => state.userAuth);
  const { flow, active } = useSelector(state => state.flowState);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = async () => {
    try {
      setIsLoading(true);
      const ret = await getUserFinishDetails(data._id);
      const obj = ret.data.data || null;// redirection Link and text to render
      await setFinishObj(obj);
    } catch (error) {
      await setFinishObj(null);
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

  const getRedirectionLink = (link) => {
    if (!link) return;
    return link.startsWith("http://") || link.startsWith("https://") ?
      link : `https://${link}`
  };

  const handleSubmit = async () => {
    const isRedirect = Boolean(finishObj?.redirectionLink);
    const isLastStep = Array.isArray(flow) && active > -1 && active === flow.length - 1;

    if (isRedirect && isLastStep) {
      // Save data to DB without changing Redux state (no finished=true),
      // so if navigation is canceled by the browser, user still sees
      // the Finish page and can retry.
      try {
        const pageType = flow[active]?.type;
        if (pageType === 'FACEBOOK' || pageType === 'TWITTER') {
          await trackPageMetaData({ finishedAt: getCurrentUTCTime(), pageId: flow[active]._id });
        }
        await dispatch(updateUserMain({ finishedAt: getCurrentUTCTime() }));
        await dispatch(userLogout());
      } catch (error) {
        // Data may already be saved from a previous attempt — continue to redirect
      }
      window.onbeforeunload = null;
      const redirectURL = getRedirectionLink(finishObj.redirectionLink);
      if (redirectURL) {
        window.location.href = redirectURL;
      }
    } else {
      try {
        await dispatch(updateFlowActiveState());
      } catch (error) {
        // noop: error handling is already surfaced via redux snackbar
      }
    }
  };

  return (
   <>
      {isLoading && <Progress />}
      {!isLoading && finishObj ? 
        <>
          <p className='finishText'>{finishObj.text ? finishObj.text : ""}</p>
          {finishObj.redirectionLink &&
          <div className='finishLink'>
            <Link component="button" onClick={handleSubmit}>
              {translations?.click_here_to_continue_to_the_next_part_of_this_study || USER_TRANSLATIONS_DEFAULT.CLICK_TO_CONTINUE_STUDY}
            </Link>
          </div>
          }
        </>
      : null}

      {!isLoading && (
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          className={classes.submit}
          endIcon={<IconChevronRight />}
        >
          {translations?.next || "NEXT"}
        </Button>
      )}
    </>
  );
};

export default Finish;
