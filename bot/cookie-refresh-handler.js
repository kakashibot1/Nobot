/**
 * Cookie Refresh Handler - Fixes cookie expiration issues
 * Implements retry logic and error handling for cookie refresh
 */

module.exports = function createCookieRefreshHandler(facebookAccount, config) {
  let cookieRefreshRetries = 0;
  const maxRetries = 3;
  let refreshInterval = null;

  return {
    startRefreshCycle: async function(getAppStateFromEmail, writeFileSync, dirAccount, filterKeysAppState, log, getText, startBot, sleep) {
      if (!facebookAccount.email || !facebookAccount.password) {
        log.warn("COOKIE REFRESH", "Email/password not configured, skipping auto-refresh");
        return;
      }

      if (isNaN(facebookAccount.intervalGetNewCookie) || facebookAccount.intervalGetNewCookie <= 0) {
        log.info("COOKIE REFRESH", "Auto-refresh disabled (intervalGetNewCookie <= 0)");
        return;
      }

      const intervalMs = facebookAccount.intervalGetNewCookie * 60 * 1000;

      log.info("COOKIE REFRESH", `Auto-refresh scheduled every ${facebookAccount.intervalGetNewCookie} minutes`);

      refreshInterval = setInterval(async () => {
        await this.refreshCookieNow(
          getAppStateFromEmail,
          writeFileSync,
          dirAccount,
          filterKeysAppState,
          log,
          getText,
          startBot,
          sleep
        );
      }, intervalMs);
    },

    refreshCookieNow: async function(getAppStateFromEmail, writeFileSync, dirAccount, filterKeysAppState, log, getText, startBot, sleep) {
      try {
        log.info("COOKIE REFRESH", "Starting cookie refresh...");
        const appState = await getAppStateFromEmail(undefined, facebookAccount);

        if (!appState || appState.length === 0) {
          throw new Error("Empty appState returned");
        }

        if (facebookAccount.i_user) {
          appState.push({
            key: "i_user",
            value: facebookAccount.i_user,
            domain: "facebook.com",
            path: "/",
            hostOnly: false,
            creation: new Date().toISOString(),
            lastAccessed: new Date().toISOString()
          });
        }

        // changeFbStateByCode pattern
        global.changeFbStateByCode = true;
        writeFileSync(dirAccount, JSON.stringify(filterKeysAppState(appState), null, 2));
        setTimeout(() => { global.changeFbStateByCode = false; }, 1000);

        log.info("COOKIE REFRESH", "Cookie refresh successful");
        cookieRefreshRetries = 0; // Reset on success
        return true;
      } catch (err) {
        cookieRefreshRetries++;
        log.err(
          "COOKIE REFRESH",
          `Failed (attempt ${cookieRefreshRetries}/${maxRetries}): ${err.message}`
        );

        if (cookieRefreshRetries >= maxRetries) {
          log.err("COOKIE REFRESH", "Max retries reached. Please update credentials in config.");
          cookieRefreshRetries = 0;
          return false;
        }

        // Retry with exponential backoff
        const retryDelayMs = Math.min(5 * 60 * 1000, (cookieRefreshRetries * 2) * 60 * 1000);
        log.warn("COOKIE REFRESH", `Retrying in ${retryDelayMs / 1000}s...`);
        await sleep(retryDelayMs);
        return false;
      }
    },

    stopRefreshCycle: function() {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    }
  };
};
