/**
 * MQTT Reconnection Handler - Fixes Facebook bot connectivity issues
 * Handles automatic reconnection to MQTT when connection is lost
 */

module.exports = function createMqttReconnectHandler() {
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelays = [3000, 5000, 10000, 15000, 30000]; // Progressive delays

  return {
    handleMqttError: async function(error, options) {
      const { api, log, getText, stopListening, sleep, createCallBackListen } = options;

      if (
        error.error === "Not logged in" ||
        error.error === "Not logged in." ||
        error.error === "Connection refused: Server unavailable"
      ) {
        log.err("MQTT_RECONNECT", `Connection lost: ${error.error}`);
        
        if (reconnectAttempts >= maxReconnectAttempts) {
          log.err("MQTT_RECONNECT", "Max reconnection attempts reached, restart required");
          reconnectAttempts = 0;
          return false;
        }

        reconnectAttempts++;
        const delayMs = reconnectDelays[reconnectAttempts - 1] || 30000;

        log.warn(
          "MQTT_RECONNECT",
          `Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts}) in ${delayMs / 1000}s...`
        );

        await sleep(delayMs);

        try {
          await stopListening();
          await sleep(1000);
          
          const keyListen = Date.now();
          global.GoatBot.Listening = api.listenMqtt(createCallBackListen(keyListen));
          
          log.info("MQTT_RECONNECT", "Successfully reconnected to MQTT");
          reconnectAttempts = 0;
          return true;
        } catch (err) {
          log.err("MQTT_RECONNECT", `Reconnection failed: ${err.message}`);
          return false;
        }
      }

      return null;
    },

    resetAttempts: function() {
      reconnectAttempts = 0;
    }
  };
};
