import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getFacebookPostsCount,
  clearFacebookState
} from '../../../../../actions/socialMedia';
import useStyles from '../../../../style';
import { Navigate } from 'react-router-dom';
import { updateFlowActiveState } from '../../../../../actions/flowState';
import { Button } from '@material-ui/core';
import { IconChevronRight } from '@tabler/icons-react';
import Sidebar from './Sidebar/Sidebar';
import Feed from './Feed/Feed';
import TweetBox from './Feed/TweetBox/TweetBox';
import { WINDOW_GLOBAL, TW_TRANSLATIONS_DEFAULT } from '../../../../../constants';

import "./Twitter.css";
import Progress from '../../../../Common/Progress';

const Twitter = ({ data }) => {
  const { isLoggedInUser, translations, languageName } = useSelector(state => state.userAuth);
  const totalPostCount = useSelector(state => state.socialMedia.totalPostCount);
  const socialMediaTranslations = useSelector(state => state.socialMedia.socialMediaTranslations);
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
    // clear old social media state
    dispatch(clearFacebookState());
    // fetch all social media Ids and their counts
    const getRequest = {
      templateId: data.templateId,
      pageId: data._id,
      platform: data.type,
      order: data.pageDataOrder,
      language: languageName,
    }
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
      <div className="twitter">
        <div className="hideInMobile">
          <Sidebar />
        </div>

        <div className="twitterFeed">
          {/* header */}
          <div className="twitterFeedHeader">
            <h2>{socialMediaTranslations?.home || TW_TRANSLATIONS_DEFAULT.HOME}</h2>
          </div>

          {/* tweetbox */}
          <div key={"twitter"}>
            <TweetBox 
              placeholderText={socialMediaTranslations?.["what's_happening?"] || TW_TRANSLATIONS_DEFAULT.WHATS_HAPPENING}
              replyTo={null}
              quoteTweet={null}
              handleCloseModal={null} />
          </div>
          {/* twitter feed */}
          {totalPostCount && totalPostCount > 0 ? 
            <Feed omitInteractionBar={data?.omitInteractionBar || false}/> 
          : <p>No Posts Exists!</p>}

          <div className="twitterNextScreen">
            {canShowNextButton && (
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Twitter;
