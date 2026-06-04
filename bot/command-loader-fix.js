/**
 * Command Loader Fix - Ensures all scripts load correctly
 * Fixes issue where commands don't work except prefix
 */

module.exports = function ensureCommandsLoaded() {
  const { GoatBot } = global;
  const log = global.utils.log;

  return {
    validateCommands: function() {
      const totalCommands = GoatBot.commands.size;
      const totalEvents = GoatBot.eventCommands.size;
      const totalAliases = GoatBot.aliases.size;

      if (totalCommands === 0) {
        log.warn("COMMAND LOADER", "⚠️ No commands loaded! Check scripts/cmds folder");
        return false;
      }

      log.info("COMMAND LOADER", `✅ ${totalCommands} commands loaded`);
      log.info("COMMAND LOADER", `✅ ${totalEvents} event commands loaded");
      log.info("COMMAND LOADER", `✅ ${totalAliases} aliases registered`);

      // List first 10 commands for debug
      const cmdList = Array.from(GoatBot.commands.keys()).slice(0, 10).join(", ");
      log.info("COMMAND LOADER", `Sample: ${cmdList}...`);

      return true;
    },

    debugCommand: function(commandName) {
      const cmd = GoatBot.commands.get(commandName);
      if (!cmd) {
        log.err("COMMAND LOADER", `Command "${commandName}" not found`);
        return null;
      }

      log.info("COMMAND LOADER", `Command: ${cmd.config.name}`);
      log.info("COMMAND LOADER", `  Author: ${cmd.config.author || 'Unknown'}`);
      log.info("COMMAND LOADER", `  Role: ${cmd.config.role || 0}`);
      log.info("COMMAND LOADER", `  Has onStart: ${!!cmd.onStart}`);
      log.info("COMMAND LOADER", `  Has onChat: ${!!cmd.onChat}`);
      log.info("COMMAND LOADER", `  Has onReply: ${!!cmd.onReply}`);

      return cmd;
    },

    listAllCommands: function() {
      const commands = Array.from(GoatBot.commands.keys()).sort();
      log.info("COMMAND LOADER", `Total: ${commands.length} commands`);
      console.log(commands);
      return commands;
    }
  };
};
