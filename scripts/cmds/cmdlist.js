/**
 * Command List - Debug tool to verify all scripts are loaded
 */

module.exports = {
  config: {
    name: "cmdlist",
    version: "1.0",
    author: "Debug Tool",
    countDown: 0,
    role: 0,
    description: "List all loaded commands",
    category: "debug",
    guide: {
      en: "{pn} - Show all loaded commands"
    }
  },

  onStart: async function ({ message, event }) {
    try {
      const { commands } = global.GoatBot;
      const cmdArray = Array.from(commands.keys()).sort();
      
      let msg = `📋 **LOADED COMMANDS (${cmdArray.length})**\n\n`;
      
      // Split into pages (Facebook has message limits)
      const pageSize = 50;
      for (let i = 0; i < cmdArray.length; i += pageSize) {
        const page = cmdArray.slice(i, i + pageSize);
        msg += page.map((c, idx) => `${i + idx + 1}. ${c}`).join("\n") + "\n";
      }
      
      return message.reply(msg);
    } catch (err) {
      return message.reply(`❌ Error: ${err.message}`);
    }
  }
};
