import {
  REST,
  Routes,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder,
  type ButtonInteraction,
} from "discord.js";
import noblox from "noblox.js";
import { storage } from "../storage";
import * as roblox from "./roblox";

// Word list for verification
const VERIFICATION_WORDS = [
  "adventure", "available", "beautiful", "calculate", "dangerous", "education", "frequency", "gathering", "happiness", "important",
  "knowledge", "landscape", "mountains", "neighbor", "objective", "passionate", "question", "relationship", "signature", "telephone",
  "umbrella", "vacation", "wonderful", "yesterday", "architect", "business", "community", "different", "experience", "furniture",
  "government", "hospital", "identity", "judgment", "language", "medicine", "notebook", "operation", "platform", "quality",
  "resource", "strategy", "terminal", "universe", "variable", "workshop", "activity", "boundary", "capacity", "delivery",
  "element", "feedback", "gradient", "hierarchy", "instance", "journey", "keyword", "location", "momentum", "network",
  "original", "priority", "quantity", "reaction", "security", "template", "ultimate", "velocity", "wildlife", "analysis",
  "behavior", "category", "database", "evidence", "function", "guidance", "heritage", "interest", "junction", "keyboard",
  "lifestyle", "material", "notation", "opinion", "practice", "quartet", "recovery", "standard", "together", "upward",
  "vertical", "warranty", "xenophobia", "youngster", "zodiacal", "ambition", "brilliant", "calendar", "document", "electric"
];

function generateVerificationCode(): string {
  const selected = [];
  const words = [...VERIFICATION_WORDS];
  for (let i = 0; i < 5; i++) {
    const idx = Math.floor(Math.random() * words.length);
    selected.push(words.splice(idx, 1)[0]);
  }
  return selected.join(" ");
}

// XP Thresholds configuration
const RANK_THRESHOLDS = [
  { xp: 0, rankId: 1, name: "Recruit" },
  { xp: 1, rankId: 16, name: "Private" },
  { xp: 5, rankId: 17, name: "Lance Corporal" },
  { xp: 10, rankId: 18, name: "Corporal" },
  { xp: 20, rankId: 19, name: "Sergeant" },
  { xp: 35, rankId: 20, name: "Staff Sergeant" },
  { xp: null, rankId: 21, name: "Company Sergeant Major" },
  { xp: null, rankId: 22, name: "Regimental Sergeant Major" },
  { xp: null, rankId: 24, name: "Officer Cadet" },
  { xp: null, rankId: 26, name: "Second Lieutenant" },
  { xp: null, rankId: 28, name: "Lieutenant" },
  { xp: null, rankId: 29, name: "Captain" },
  { xp: null, rankId: 221, name: "Major" },
  { xp: null, rankId: 223, name: "Lieutenant Colonel" },
  { xp: null, rankId: 224, name: "Colonel" },
  { xp: null, rankId: 225, name: "Brigadier" },
  { xp: null, rankId: 226, name: "Major General" },
  { xp: null, rankId: 227, name: "Lieutenant General" },
  { xp: null, rankId: 228, name: "General" },
  { xp: null, rankId: 229, name: "Developer" },
  { xp: null, rankId: 230, name: "Army Sergeant Major" },
  { xp: null, rankId: 254, name: "Vice Chief of Defence Staff" },
  { xp: null, rankId: 255, name: "Chief of Defence Staff" },
];

const SHOP_ITEMS = [
  { id: "c1dX6!9tq", name: "Picture Permissions", role: "1471657925687640167", cost: 6000 },
  { id: "zXpl^0-&", name: "DJ Permissions", role: "1471658218433282108", cost: 12000 },
  { id: "fF711*tgH", name: "Premium Access", role: "1471658317553074340", cost: 1000000 },
  { id: "$12hb.8*0", name: "GOLD ROLE", role: "1471658250247213128", cost: 10000 },
];

const MOD_ROLE_ID = "1438132224926158968";
const BT_PASS_ROLES = ["1438132224926158961", "1438132224926158968"];
const RANK_SET_ROLE_ID = "1438132224938737804";
const AWARD_ROLES = [
  "1438132224980680714",
  "1438132224963907693",
  "1438132224963907694",
];

const AWARDS_LIST = [
  "Victoria Cross",
  "George Cross",
  "Distinguished Flying Cross",
  "Distinguished Service Cross",
  "Distinguished Service Order",
  "Military Medal",
  "Mentioned in Dispatches",
  "General's Commendation Medal",
];

const ROLE_COMMAND_ROLES = [
    "1438132224938737803",
    "1438132224980680714",
    "1438132224963907693",
    "1438132224938737804"
];

const ROLE_MAP: Record<number, string> = {
    0: "[CIV]",
    1: "[REC]",
    16: "[PVT]",
    17: "[LCPL]",
    18: "[CPL]",
    19: "[SGT]",
    20: "[SSGT]",
    21: "[CSM]",
    22: "[RSM]",
    24: "[OCDT]",
    26: "[2LT]",
    28: "[LT]",
    29: "[CPT]",
    221: "[MAJ]",
    223: "[LTCOL]",
    224: "[COL]",
    225: "[BRIG]",
    226: "[MGEN]",
    227: "[LTGEN]",
    228: "[GEN]",
    229: "[DEV]",
    230: "[ASM]",
    253: "[VCDS]",
    255: "[CDS]"
};

const DISCORD_ROLES = [
    { min: 1, max: 24, role: "1438132224938737801" },
    { min: 26, max: 220, role: "1438133829121347705" },
    { min: 221, max: 224, role: "1438134100635684955" },
    { min: 225, max: 228, role: "1438132224938737804" },
    { min: 229, max: 255, role: "1438132224963907693" },
    { rank: 230, role: "1438132224963907689" },
    { rank: 254, role: "1438132224963907691" },
    { rank: 255, role: "1438132224963907692" }
];

const GROUP_ROLES = [
    { groupId: 1089082527, role: "1438132224926158966" },
    { groupId: 412016994, role: "1438132224926158965" },
    { groupId: 224669348, role: "1438132224926158964" },
    { groupId: 696343524, role: "1438132224926158962" },
    { groupId: 322660662, role: "1438132224926158961" },
    { groupId: 734703686, role: "1466649828544086242" },
    { groupId: 232666713, role: "1438132224926158960" },
    { groupId: 766912819, role: "1465866857503391915" },
    { groupId: 132897282, role: "1465866954492346379" },
    { groupId: 161518761, role: "1465866919180763187" }
];

const MAIN_GROUP_ROLE = "1438132224439615573";

export const commands = [
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Link your Roblox and Discord accounts")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Your Roblox username")
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName("account")
    .setDescription("Manage linked accounts")
    .addSubcommand(sub =>
        sub.setName("switch")
           .setDescription("Switch active account")
           .addStringOption(opt => opt.setName("username").setDescription("Roblox username").setRequired(true))),

  new SlashCommandBuilder()
    .setName("getroles")
    .setDescription("Update your roles and nickname based on Roblox rank"),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View a user's profile")
    .addUserOption(opt => opt.setName("user").setDescription("Target user")),

  new SlashCommandBuilder()
    .setName("store")
    .setDescription("View the British Army Store"),

  new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the store")
    .addStringOption(opt => opt.setName("item_id").setDescription("Item ID to buy").setRequired(true)),

  new SlashCommandBuilder()
    .setName("xp")
    .setDescription("Manage XP (Authorized only)")
    .addSubcommand((sub) =>
      sub
        .setName("add")
        .setDescription("Add XP")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt.setName("amount").setDescription("Amount").setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove XP")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt.setName("amount").setDescription("Amount").setRequired(true),
        ),
    ),

  new SlashCommandBuilder()
    .setName("pass")
    .setDescription("BT Pass commands")
    .addSubcommand((sub) =>
      sub
        .setName("bt")
        .setDescription("ETS may use this command to promote a user to Private")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        ),
    ),

  new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Rank management (Authorized only)")
    .addSubcommand((sub) =>
      sub
        .setName("set")
        .setDescription("Set a user's rank")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        )
        .addIntegerOption((opt) =>
          opt.setName("rank_id").setDescription("Roblox Rank ID").setRequired(true),
        )),

  new SlashCommandBuilder()
    .setName("ranks")
    .setDescription("View all ranks and XP thresholds"),

  new SlashCommandBuilder()
    .setName("awards")
    .setDescription("Manage awards (Authorized only)")
    .addSubcommand((sub) =>
      sub
        .setName("give")
        .setDescription("Give an award")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        )
        .addStringOption((opt) =>
          opt.setName("award_name").setDescription("Award name").setRequired(true).addChoices(
            ...AWARDS_LIST.map(a => ({ name: a, value: a }))
          ),
        )
        .addIntegerOption((opt) =>
          opt.setName("amount").setDescription("Amount").setRequired(true),
        ))
    .addSubcommand((sub) =>
      sub
        .setName("remove")
        .setDescription("Remove an award")
        .addUserOption((opt) =>
          opt.setName("user").setDescription("Target user").setRequired(true),
        )
        .addStringOption((opt) =>
          opt.setName("award_name").setDescription("Award name").setRequired(true).addChoices(
            ...AWARDS_LIST.map(a => ({ name: a, value: a }))
          ),
        )
        .addIntegerOption((opt) =>
          opt.setName("amount").setDescription("Amount").setRequired(true),
        )),

  new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage user roles (Authorized only)")
    .addUserOption(opt => opt.setName("user").setDescription("Target user").setRequired(true))
    .addRoleOption(opt => opt.setName("role").setDescription("Role to give/remove").setRequired(true))
    .addStringOption(opt => opt.setName("action").setDescription("Give or remove").setRequired(true).addChoices(
        { name: "Give", value: "give" },
        { name: "Remove", value: "remove" }
    )),

  new SlashCommandBuilder()
    .setName("pounds")
    .setDescription("View your current balance of pounds"),

  new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Gamble pounds with dice")
    .addIntegerOption(opt => opt.setName("amount").setDescription("Amount to bet (min 100)").setRequired(true).setMinValue(100)),

  new SlashCommandBuilder()
    .setName("roulette")
    .setDescription("Gamble pounds with roulette (5/6 win chance)")
    .addIntegerOption(opt => opt.setName("amount").setDescription("Amount to bet (min 100)").setRequired(true).setMinValue(100)),

  new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Claim your daily pounds (every 12 hours)"),

  new SlashCommandBuilder()
    .setName("work")
    .setDescription("Earn pounds by working (every 1 hour)"),

  new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update your group rank based on XP"),

  new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a user by 1 rank (Authorized only)")
    .addUserOption(opt => opt.setName("user").setDescription("Target user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("demote")
    .setDescription("Demote a user by 1 rank (Authorized only)")
    .addUserOption(opt => opt.setName("user").setDescription("Target user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("groupkick")
    .setDescription("Kick a user from the Roblox group (Rank 200+ only)")
    .addUserOption(opt => opt.setName("user").setDescription("Target user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("groupban")
    .setDescription("Ban a user from the Roblox group (Rank 100+ only)")
    .addUserOption(opt => opt.setName("user").setDescription("Target user").setRequired(true)),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to kick").setRequired(true),
    )
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to ban").setRequired(true),
    )
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to timeout").setRequired(true),
    )
    .addIntegerOption((opt) =>
      opt
        .setName("minutes")
        .setDescription("Duration in minutes")
        .setRequired(true),
    )
    .addStringOption((opt) => opt.setName("reason").setDescription("Reason")),

  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption((opt) =>
      opt.setName("user").setDescription("User to warn").setRequired(true),
    )
    .addStringOption((opt) =>
      opt.setName("reason").setDescription("Reason").setRequired(true),
    ),
];

import { logToChannel } from "./logger";

export async function handleInteraction(
  interaction: any,
) {
  const { commandName } = interaction;
  
  // Handle profile specifically to allow mock objects
  if (commandName === "profile") {
    await handleProfile(interaction);
    return;
  }

  if (typeof interaction.isChatInputCommand === 'function' && !interaction.isChatInputCommand()) return;

  if (commandName === "verify") {
    await handleVerify(interaction);
  } else if (commandName === "account") {
    await handleAccount(interaction);
  } else if (commandName === "getroles") {
    await handleGetRoles(interaction);
  } else if (commandName === "store") {
    await handleStore(interaction);
  } else if (commandName === "buy") {
    await handleBuy(interaction);
  } else if (commandName === "xp") {
    await handleXp(interaction);
  } else if (commandName === "pass") {
    await handlePass(interaction);
  } else if (commandName === "rank") {
    await handleRank(interaction);
  } else if (commandName === "ranks") {
    await handleRanks(interaction);
  } else if (commandName === "awards") {
    await handleAward(interaction);
  } else if (commandName === "role") {
    await handleRole(interaction);
  } else if (commandName === "pounds") {
    await handlePounds(interaction);
  } else if (commandName === "dice") {
    await handleDice(interaction);
  } else if (commandName === "roulette") {
    await handleRoulette(interaction);
  } else if (commandName === "daily") {
    await handleDaily(interaction);
  } else if (commandName === "work") {
    await handleWork(interaction);
  } else if (commandName === "update") {
    await handleUpdate(interaction);
  } else if (commandName === "promote") {
    await handlePromote(interaction);
  } else if (commandName === "demote") {
    await handleDemote(interaction);
  } else if (commandName === "groupkick") {
    await handleGroupKick(interaction);
  } else if (commandName === "groupban") {
    await handleGroupBan(interaction);
  } else if (["kick", "ban", "timeout", "warn"].includes(commandName)) {
    await handleModeration(interaction);
  }
}

async function handleAccount(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  if (subcommand === "switch") {
    const usernameInput = interaction.options.getString("username", true).toLowerCase();
    const users = await storage.getAllUsersByDiscordId(interaction.user.id);
    const target = users.find(u => u.username?.toLowerCase() === usernameInput);

    if (!target || !target.robloxId) {
      await interaction.reply({ content: "Account not found.", ephemeral: true });
      return;
    }

    await storage.setActiveAccount(interaction.user.id, target.robloxId);
    await interaction.reply({ content: `Switched active account to **${target.username}**.`, ephemeral: true });
  }
}

const GAMEPASS_RANKS = [
  { gamepassId: 1716701749, rankId: 16 },
  { gamepassId: 1716767838, rankId: 18 },
  { gamepassId: 1718839513, rankId: 20 },
];

async function handleGetRoles(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  const dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);

  if (!dbUser || !dbUser.robloxId || !dbUser.isVerified) {
    await interaction.editReply("You are not verified.");
    return;
  }

  const member = interaction.member as any;
  const robloxId = Number(dbUser.robloxId);

  try {
    const currentRankId = await roblox.getGroupRankId(robloxId);
    
    // Check gamepasses
    let targetRankFromPass = 0;
    for (const gp of GAMEPASS_RANKS) {
      try {
        const ownsPass = await (noblox as any).getOwnership(robloxId, gp.gamepassId, 'GamePass');
        if (ownsPass && gp.rankId > targetRankFromPass) {
          targetRankFromPass = gp.rankId;
        }
      } catch (e) {}
    }

    if (targetRankFromPass > currentRankId) {
      await roblox.setRobloxRank(robloxId, targetRankFromPass);
    }

    const rankId = await roblox.getGroupRankId(robloxId);
    const prefix = ROLE_MAP[rankId] || "[CIV]";
    const newNickname = `${prefix} ${dbUser.username}`;

    if (member.manageable) {
      await member.setNickname(newNickname);
    }

    const rolesToAdd = [];
    const rolesToRemove = [];

    if (rankId > 0) rolesToAdd.push(MAIN_GROUP_ROLE);
    else rolesToRemove.push(MAIN_GROUP_ROLE);

    for (const r of DISCORD_ROLES) {
      if ((r.rank !== undefined && r.rank === rankId) || (r.min !== undefined && r.max !== undefined && rankId >= r.min && rankId <= r.max)) {
        rolesToAdd.push(r.role);
      } else {
        rolesToRemove.push(r.role);
      }
    }

    for (const g of GROUP_ROLES) {
        try {
            const inGroupRank = await noblox.getRankInGroup(g.groupId, robloxId);
            if (inGroupRank > 0) rolesToAdd.push(g.role);
            else rolesToRemove.push(g.role);
        } catch (e) {}
    }

    await member.roles.add(rolesToAdd);
    await member.roles.remove(rolesToRemove);

    if (rankId < 21) {
        const targetRank = RANK_THRESHOLDS.slice().reverse().find(r => r.xp !== null && dbUser.xp >= r.xp);
        if (targetRank && targetRank.rankId !== rankId) {
            await roblox.setRobloxRank(robloxId, targetRank.rankId);
        }
    }

    await interaction.editReply("Roles and nickname updated successfully.");
  } catch (err) {
    console.error(err);
    await interaction.editReply("Failed to update roles.");
  }
}

async function handleProfile(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser("user") || interaction.user;
    await interaction.deferReply();

    try {
        let dbUser = await storage.getActiveUserByDiscordId(targetUser.id);
        if (!dbUser) {
            dbUser = await storage.createUser({ 
              discordId: targetUser.id, 
              xp: 0, 
              isVerified: false, 
              isActive: true,
              pounds: 0 
            });
        }

        const embed = new EmbedBuilder()
            .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL() })
            .setColor(0x5865F2);

        // XP & Rank
        const nextRank = RANK_THRESHOLDS.find(r => r.xp !== null && r.xp > dbUser!.xp);
        const xpUntilRank = nextRank ? (nextRank.xp! - dbUser!.xp) : "Max";
        
        embed.addFields({
            name: `__${targetUser.username}'s XP__`,
            value: `XP: ${dbUser.xp}\nXP until ${nextRank?.name || "Max"}: ${xpUntilRank}\nRank: ${dbUser.rank || "None"}`
        });

        // Awards
        let awardsList = "None";
        try {
            const awards = JSON.parse(dbUser.awards || "[]");
            if (awards.length > 0) {
                awardsList = awards.map((a: any) => `${a.name}: ${a.amount}`).join("\n");
            }
        } catch(e) {}
        embed.addFields({ name: `__${targetUser.username}'s Awards__`, value: awardsList || "None" });

        // Roles
        const member = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);
        const roles = member?.roles.cache.filter(r => r.name !== "@everyone").map(r => r.toString()).join(", ") || "None";
        embed.addFields({ name: `__${targetUser.username}'s Roles__`, value: roles || "None" });

        // Details
        let robloxDetails = "Not Verified";
        let joinDateStr = "N/A";
        let armyDays = "N/A";

        if (dbUser.robloxId) {
            try {
                const playerInfo = await roblox.getPlayerInfo(Number(dbUser.robloxId)) as any;
                const age = Math.floor((Date.now() - new Date(playerInfo.joinDate).getTime()) / (1000 * 60 * 60 * 24));
                robloxDetails = `Account Age: ${age} days\nJoin Date: ${new Date(playerInfo.joinDate).toLocaleDateString()}`;
                
                const armyJoinDate = dbUser.lastXpUpdate || new Date();
                joinDateStr = new Date(armyJoinDate).toLocaleDateString();
                armyDays = Math.floor((Date.now() - new Date(armyJoinDate).getTime()) / (1000 * 60 * 60 * 24)).toString();
            } catch(e) {}
        }

        const discordAge = Math.floor((Date.now() - targetUser.createdTimestamp) / (1000 * 60 * 60 * 24));
        const discordJoin = member?.joinedTimestamp ? new Date(member.joinedTimestamp).toLocaleDateString() : "N/A";

        embed.addFields({
            name: `__${targetUser.username}'s Details__`,
            value: `ROBLOX ${robloxDetails}\n\nDiscord Account Age: ${discordAge} days\nDiscord Join Date: ${discordJoin}\nJoined the British Army on: ${joinDateStr}\nIn the British Army for ${armyDays} days.`
        });

        // Groups
        let groupData = "None";
        let ownedGamepasses = "None";
        if (dbUser.robloxId) {
            try {
                const groups = await noblox.getGroups(Number(dbUser.robloxId));
                if (groups && groups.length > 0) {
                    groupData = groups.map(g => `**${g.Name}**: ${g.Role}`).join("\n");
                }

                const passes = [];
                for (const gp of GAMEPASS_RANKS) {
                  const owns = await (noblox as any).getOwnership(Number(dbUser.robloxId), gp.gamepassId, 'GamePass');
                  if (owns) {
                    passes.push(`Gamepass ${gp.gamepassId}`);
                  }
                }
                if (passes.length > 0) ownedGamepasses = passes.join("\n");
            } catch(e) {}
        }
        embed.addFields({ name: `__${targetUser.username}'s Groups__`, value: groupData.substring(0, 1024) || "None" });
        embed.addFields({ name: `__Owned Gamepasses__`, value: ownedGamepasses });

        await interaction.editReply({ embeds: [embed] });
    } catch (err) {
        console.error("Profile error:", err);
        await interaction.editReply("An error occurred while fetching the profile. Please ensure the user is in the server.");
    }
}

async function handleStore(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle("British Army Store")
        .setDescription("Use `/buy [item_id]` to purchase items with your £'s.")
        .setColor(0xFFA500);

    for (const item of SHOP_ITEMS) {
        embed.addFields({ name: item.name, value: `Price: £${item.cost}\nID: \`${item.id}\``, inline: true });
    }

    await interaction.reply({ embeds: [embed] });
}

async function handleBuy(interaction: ChatInputCommandInteraction) {
    const itemId = interaction.options.getString("item_id", true);
    const item = SHOP_ITEMS.find(i => i.id === itemId);

    if (!item) {
        await interaction.reply({ content: "Invalid item ID.", ephemeral: true });
        return;
    }

    const dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
    if (!dbUser || dbUser.pounds < item.cost) {
        await interaction.reply({ content: `You don't have enough £'s. Cost: £${item.cost}`, ephemeral: true });
        return;
    }

    const member = interaction.member as any;
    try {
        await member.roles.add(item.role);
        await storage.updateUser(dbUser.id, { pounds: dbUser.pounds - item.cost });
        await interaction.reply({ content: `Successfully purchased **${item.name}** for £${item.cost}!` });
    } catch (e) {
        await interaction.reply({ content: "Failed to give role. Please contact an admin.", ephemeral: true });
    }
}

async function handleVerify(interaction: ChatInputCommandInteraction) {
  const usernameInput = interaction.options.getString("username", true);
  await interaction.deferReply({ ephemeral: true });

  try {
    const robloxId = await roblox.getRobloxIdFromUsername(usernameInput);
    if (!robloxId) {
      await interaction.editReply(`Could not find user ${usernameInput}`);
      return;
    }

    const username = await roblox.getUsernameFromRobloxId(robloxId);
    const code = generateVerificationCode();
    
    const existingPairs = await storage.getAllUsersByDiscordId(interaction.user.id);
    const alreadyLinked = existingPairs.find(u => u.robloxId === String(robloxId));
    
    if (alreadyLinked && alreadyLinked.isVerified) {
        await interaction.editReply(`The Roblox account ${usernameInput} is already linked to your Discord account.`);
        return;
    }

    const robloxUser = await storage.getUserByRobloxId(String(robloxId));
    if (robloxUser && robloxUser.discordId !== interaction.user.id && robloxUser.isVerified) {
      await interaction.editReply("This Roblox account is already linked to another Discord user.");
      return;
    }

    let existing = existingPairs.find(u => u.robloxId === String(robloxId));
    if (existing) {
        await storage.updateUser(existing.id, { verificationCode: code });
    } else {
        await storage.createUser({
            discordId: interaction.user.id,
            robloxId: String(robloxId),
            username,
            verificationCode: code,
            xp: 0,
            isVerified: false,
            isActive: false
        });
    }

    const doneButton = new ButtonBuilder()
      .setCustomId(`verify_done_${robloxId}`)
      .setLabel("Done")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(doneButton);

    const embed = new EmbedBuilder()
      .setTitle("Account Verification")
      .setDescription(`To verify as **${username}**, please set your Roblox profile description to the following code:\n\n\`${code}\`\n\nProfile Link: https://www.roblox.com/users/${robloxId}/profile\n\nOnce done, click the button below.`)
      .setColor(0x5865F2);

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  } catch (err) {
    console.error(err);
    await interaction.editReply("Error verifying user.");
  }
}

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  if (interaction.customId === "verify_start") {
    await interaction.reply({
      content: "To verify your account, please message me directly (DM) with the command:\n\n`/verify username`",
      ephemeral: true
    });
    return;
  }

  if (interaction.customId.startsWith("verify_done_")) {
    const robloxId = interaction.customId.replace("verify_done_", "");
    await interaction.deferUpdate();

    try {
      const allUsers = await storage.getAllUsersByDiscordId(interaction.user.id);
      const dbUser = allUsers.find(u => u.robloxId === String(robloxId));

      if (!dbUser || !dbUser.verificationCode) {
        await interaction.followUp({ content: "Verification session not found.", ephemeral: true });
        return;
      }

      const playerInfo = await roblox.getPlayerInfo(Number(robloxId)) as any;
      if (playerInfo.blurb.toLowerCase().includes(dbUser.verificationCode.toLowerCase())) {
        await storage.setActiveAccount(interaction.user.id, String(robloxId));
        await storage.updateUser(dbUser.id, {
          isVerified: true,
          verificationCode: null,
          isActive: true
        });

        // Deactivate other accounts for this user
        const otherAccounts = allUsers.filter(u => u.robloxId !== String(robloxId));
        for (const acc of otherAccounts) {
          await storage.updateUser(acc.id, { isActive: false });
        }

        await interaction.editReply({
          content: `Successfully verified as **${dbUser.username}**!`,
          embeds: [],
          components: [],
        });
      } else {
        await interaction.followUp({ 
          content: `Verification code \`${dbUser.verificationCode}\` not found in your Roblox bio. Please update it and try again.`, 
          ephemeral: true 
        });
      }
    } catch (err) {
      console.error(err);
      await interaction.followUp({ content: "Error checking your profile. Please try again later.", ephemeral: true });
    }
  }
}

async function handleXp(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const targetUser = interaction.options.getUser("user") || interaction.user;

  const member = interaction.member as any;
  const hasRole = member?.roles?.cache?.has(MOD_ROLE_ID);

  if (!hasRole && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You do not have permission to manage XP.", ephemeral: true });
    return;
  }

  let dbUser = await storage.getUserByDiscordId(targetUser.id);
  if (!dbUser) {
    dbUser = await storage.createUser({ discordId: targetUser.id, xp: 0, isVerified: false, isActive: true });
  }

  if (subcommand === "add") {
    const amount = interaction.options.getInteger("amount", true);
    const newXp = dbUser.xp + amount;
    await storage.updateUser(dbUser.id, { xp: newXp });
    await interaction.reply(`Added ${amount} XP to ${targetUser.username}. New total: ${newXp}`);
  } else if (subcommand === "remove") {
    const amount = interaction.options.getInteger("amount", true);
    const newXp = Math.max(0, dbUser.xp - amount);
    await storage.updateUser(dbUser.id, { xp: newXp });
    await interaction.reply(`Removed ${amount} XP from ${targetUser.username}. New total: ${newXp}`);
  }
}

async function handlePass(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as any;
  const hasPermission = BT_PASS_ROLES.some(roleId => member?.roles?.cache?.has(roleId)) || 
                        interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

  if (!hasPermission) {
    await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    return;
  }

  const targetUser = interaction.options.getUser("user", true);
  await interaction.deferReply();

  let dbUser = await storage.getUserByDiscordId(targetUser.id);
  if (!dbUser) {
    dbUser = await storage.createUser({ discordId: targetUser.id, xp: 1, isVerified: false, isActive: true });
  } else {
    await storage.updateUser(dbUser.id, { xp: 1 });
  }

  if (dbUser.robloxId) {
    const success = await roblox.setRobloxRank(Number(dbUser.robloxId), 16);
    if (success) {
      await storage.updateUser(dbUser.id, { rank: "Private", rankId: 16 });
      await interaction.editReply(`Set ${targetUser.username}'s XP to 1 and promoted to Private on Roblox.`);
    } else {
      await interaction.editReply(`Set ${targetUser.username}'s XP to 1 but failed to update rank on Roblox.`);
    }
  } else {
    await interaction.editReply(`Set ${targetUser.username}'s XP to 1. Rank not updated (not verified).`);
  }
}

async function handleRank(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const targetUser = interaction.options.getUser("user", true);

  const member = interaction.member as any;
  const hasRole = member?.roles?.cache?.has(RANK_SET_ROLE_ID);

  if (!hasRole && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You do not have permission to manage ranks.", ephemeral: true });
    return;
  }

  if (subcommand === "set") {
    const rankId = interaction.options.getInteger("rank_id", true);
    await interaction.deferReply();

    let dbUser = await storage.getUserByDiscordId(targetUser.id);
    if (!dbUser || !dbUser.robloxId) {
      await interaction.editReply("User is not verified on Roblox.");
      return;
    }

    const success = await roblox.setRobloxRank(Number(dbUser.robloxId), rankId);
    if (success) {
      const rankName = await roblox.getRobloxRank(Number(dbUser.robloxId));
      await storage.updateUser(dbUser.id, { rank: rankName, rankId });
      await interaction.editReply(`Successfully set ${targetUser.username}'s rank to ${rankId} (${rankName}) on Roblox.`);
    } else {
      await interaction.editReply("Failed to set rank on Roblox.");
    }
  }
}

async function handleRanks(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setTitle("British Army Ranks")
    .setColor(0x5865F2);

  let desc = "";
  for (const r of RANK_THRESHOLDS) {
    const xpReq = r.xp === null ? "Locked." : `${r.xp} XP`;
    desc += `**[${r.rankId}] ${r.name}**: ${xpReq}\n`;
  }
  embed.setDescription(desc);
  await interaction.reply({ embeds: [embed] });
}

async function handleAward(interaction: ChatInputCommandInteraction) {
  const subcommand = interaction.options.getSubcommand();
  const member = interaction.member as any;
  const hasPermission = AWARD_ROLES.some(roleId => member?.roles?.cache?.has(roleId)) || 
                   interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

  if (!hasPermission) {
    await interaction.reply({ content: "You do not have permission to manage awards.", ephemeral: true });
    return;
  }

  const targetUser = interaction.options.getUser("user", true);
  const awardName = interaction.options.getString("award_name", true);
  const amount = interaction.options.getInteger("amount", true);

  let dbUser = await storage.getUserByDiscordId(targetUser.id);
  if (!dbUser) {
    dbUser = await storage.createUser({ discordId: targetUser.id, xp: 0, isVerified: false, isActive: true });
  }

  let awards = JSON.parse(dbUser.awards || "[]");
  const idx = awards.findIndex((a: any) => a.name === awardName);

  if (subcommand === "give") {
    if (idx > -1) awards[idx].amount += amount;
    else awards.push({ name: awardName, amount });
    await storage.updateUser(dbUser.id, { awards: JSON.stringify(awards) });
    await interaction.reply(`Gave ${amount}x **${awardName}** to ${targetUser.username}.`);
  } else if (subcommand === "remove") {
    if (idx > -1) {
      awards[idx].amount = Math.max(0, awards[idx].amount - amount);
      if (awards[idx].amount === 0) awards.splice(idx, 1);
      await storage.updateUser(dbUser.id, { awards: JSON.stringify(awards) });
      await interaction.reply(`Removed ${amount}x **${awardName}** from ${targetUser.username}.`);
    } else {
      await interaction.reply(`${targetUser.username} does not have that award.`);
    }
  }
}

async function handleRole(interaction: ChatInputCommandInteraction) {
  const member = interaction.member as any;
  const hasPermission = ROLE_COMMAND_ROLES.some(roleId => member?.roles?.cache?.has(roleId)) || 
                        interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);

  if (!hasPermission) {
    await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
    return;
  }

  const targetUser = interaction.options.getUser("user", true);
  const role = interaction.options.getRole("role", true) as any;
  const action = interaction.options.getString("action", true);

  try {
    const targetMember = await interaction.guild?.members.fetch(targetUser.id);
    if (!targetMember) return;
    if (action === "give") await targetMember.roles.add(role);
    else await targetMember.roles.remove(role);
    await interaction.reply(`Successfully ${action}n ${role.name} to/from ${targetUser.username}.`);
  } catch (err) {
    await interaction.reply({ content: "Failed to update roles.", ephemeral: true });
  }
}

async function handlePounds(interaction: ChatInputCommandInteraction) {
  const dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  await interaction.reply(`You currently have **£${dbUser?.pounds || 0}**.`);
}

async function handleDice(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);
  let dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!dbUser) dbUser = await storage.createUser({ discordId: interaction.user.id, xp: 0, isVerified: false, isActive: true });

  const now = new Date();
  if (dbUser.lastDice && now.getTime() - new Date(dbUser.lastDice).getTime() < 3600000) {
    await interaction.reply({ content: "Dice can only be used every hour.", ephemeral: true });
    return;
  }

  if (dbUser.pounds < amount) {
    await interaction.reply({ content: "Not enough pounds.", ephemeral: true });
    return;
  }

  const r1 = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;
  const r2 = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2;

  let msg = `Your total: ${r1}, Opponent: ${r2}. `;
  if (r1 > r2) {
    await storage.updateUser(dbUser.id, { pounds: dbUser.pounds + amount, lastDice: now });
    msg += `**You won £${amount}!**`;
  } else if (r1 < r2) {
    await storage.updateUser(dbUser.id, { pounds: dbUser.pounds - amount, lastDice: now });
    msg += `**You lost £${amount}!**`;
  } else {
    await storage.updateUser(dbUser.id, { lastDice: now });
    msg += "It's a draw!";
  }
  await interaction.reply(msg);
}

async function handleRoulette(interaction: ChatInputCommandInteraction) {
  const amount = interaction.options.getInteger("amount", true);
  let dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!dbUser) dbUser = await storage.createUser({ discordId: interaction.user.id, xp: 0, isVerified: false, isActive: true });

  const now = new Date();
  if (dbUser.lastRoulette && now.getTime() - new Date(dbUser.lastRoulette).getTime() < 3600000) {
    await interaction.reply({ content: "Roulette can only be used every hour.", ephemeral: true });
    return;
  }

  if (dbUser.pounds < amount) {
    await interaction.reply({ content: "Not enough pounds.", ephemeral: true });
    return;
  }

  const win = Math.random() < (5/6);
  if (win) {
    await storage.updateUser(dbUser.id, { pounds: dbUser.pounds + amount, lastRoulette: now });
    await interaction.reply(`🔫 Click... nothing happened! **You won £${amount}!**`);
  } else {
    await storage.updateUser(dbUser.id, { pounds: dbUser.pounds - amount, lastRoulette: now });
    await interaction.reply(`🔫 BANG! **You lost £${amount}!**`);
  }
}

async function handleDaily(interaction: ChatInputCommandInteraction) {
  let dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!dbUser) dbUser = await storage.createUser({ discordId: interaction.user.id, xp: 0, isVerified: false, isActive: true });

  const now = new Date();
  if (dbUser.lastDaily && now.getTime() - new Date(dbUser.lastDaily).getTime() < 12 * 3600000) {
    await interaction.reply({ content: "You can claim daily every 12 hours.", ephemeral: true });
    return;
  }

  const reward = 500;
  await storage.updateUser(dbUser.id, { pounds: dbUser.pounds + reward, lastDaily: now });
  await interaction.reply(`Claimed £${reward} daily!`);
}

async function handleWork(interaction: ChatInputCommandInteraction) {
  let dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!dbUser) dbUser = await storage.createUser({ discordId: interaction.user.id, xp: 0, isVerified: false, isActive: true });

  const now = new Date();
  if (dbUser.lastWork && now.getTime() - new Date(dbUser.lastWork).getTime() < 3600000) {
    await interaction.reply({ content: "You can work every hour.", ephemeral: true });
    return;
  }

  const reward = Math.floor(Math.random() * 200) + 100;
  await storage.updateUser(dbUser.id, { pounds: dbUser.pounds + reward, lastWork: now });
  await interaction.reply(`You worked and earned £${reward}!`);
}

async function handleUpdate(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const dbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!dbUser?.robloxId) {
    await interaction.editReply("Not verified.");
    return;
  }

  const rankId = await roblox.getGroupRankId(Number(dbUser.robloxId));
  if (rankId >= 21) {
    await interaction.editReply("Rank is locked (>= 21). No auto-update.");
    return;
  }

  const targetRank = RANK_THRESHOLDS.slice().reverse().find(r => r.xp !== null && dbUser.xp >= r.xp);
  if (targetRank && targetRank.rankId !== rankId) {
    await roblox.setRobloxRank(Number(dbUser.robloxId), targetRank.rankId);
    await storage.updateUser(dbUser.id, { rank: targetRank.name, rankId: targetRank.rankId });
    await interaction.editReply(`Updated to ${targetRank.name}!`);
  } else {
    await interaction.editReply("No update needed.");
  }
}

async function handlePromote(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user", true);
  const member = interaction.member as any;
  const hasRole = member?.roles?.cache?.has(RANK_SET_ROLE_ID);

  if (!hasRole && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You do not have permission to promote users.", ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const dbUser = await storage.getActiveUserByDiscordId(targetUser.id);
  if (!dbUser?.robloxId) {
    await interaction.editReply("User is not verified.");
    return;
  }

  try {
    const success = await roblox.promote(Number(dbUser.robloxId));
    if (success) {
      const newRankName = await roblox.getRobloxRank(Number(dbUser.robloxId));
      const newRankId = await roblox.getGroupRankId(Number(dbUser.robloxId));
      await storage.updateUser(dbUser.id, { rank: newRankName, rankId: newRankId });
      await interaction.editReply(`Promoted ${targetUser.username} to ${newRankName}.`);
    } else {
      await interaction.editReply("Failed to promote user. They might be at max rank or an error occurred.");
    }
  } catch (err) {
    await interaction.editReply("Error promoting user.");
  }
}

async function handleDemote(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user", true);
  const member = interaction.member as any;
  const hasRole = member?.roles?.cache?.has(RANK_SET_ROLE_ID);

  if (!hasRole && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You do not have permission to demote users.", ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const dbUser = await storage.getActiveUserByDiscordId(targetUser.id);
  if (!dbUser?.robloxId) {
    await interaction.editReply("User is not verified.");
    return;
  }

  try {
    const success = await roblox.demote(Number(dbUser.robloxId));
    if (success) {
      const newRankName = await roblox.getRobloxRank(Number(dbUser.robloxId));
      const newRankId = await roblox.getGroupRankId(Number(dbUser.robloxId));
      await storage.updateUser(dbUser.id, { rank: newRankName, rankId: newRankId });
      await interaction.editReply(`Demoted ${targetUser.username} to ${newRankName}.`);
    } else {
      await interaction.editReply("Failed to demote user. They might be at minimum rank or an error occurred.");
    }
  } catch (err) {
    await interaction.editReply("Error demoting user.");
  }
}

async function handleGroupKick(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user", true);
  const member = interaction.member as any;
  
  // Check if moderator is rank 200+ in Roblox group
  const modDbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!modDbUser?.robloxId) {
    await interaction.reply({ content: "You must be verified to use this command.", ephemeral: true });
    return;
  }

  const modRank = await roblox.getGroupRankId(Number(modDbUser.robloxId));
  if (modRank < 200 && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You must be rank 200+ to use this command.", ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const targetDbUser = await storage.getActiveUserByDiscordId(targetUser.id);
  if (!targetDbUser?.robloxId) {
    await interaction.editReply("User is not verified.");
    return;
  }

  try {
    await noblox.exile(Number(process.env.ROBLOX_GROUP_ID || 35143702), Number(targetDbUser.robloxId));
    await interaction.editReply(`Successfully kicked ${targetUser.username} from the Roblox group.`);
  } catch (err) {
    await interaction.editReply("Failed to kick user from the group.");
  }
}

async function handleGroupBan(interaction: ChatInputCommandInteraction) {
  const targetUser = interaction.options.getUser("user", true);
  const member = interaction.member as any;
  
  // Check if moderator is rank 100+ in Roblox group
  const modDbUser = await storage.getActiveUserByDiscordId(interaction.user.id);
  if (!modDbUser?.robloxId) {
    await interaction.reply({ content: "You must be verified to use this command.", ephemeral: true });
    return;
  }

  const modRank = await roblox.getGroupRankId(Number(modDbUser.robloxId));
  if (modRank < 100 && !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ content: "You must be rank 100+ to use this command.", ephemeral: true });
    return;
  }

  await interaction.deferReply();
  const targetDbUser = await storage.getActiveUserByDiscordId(targetUser.id);
  if (!targetDbUser?.robloxId) {
    await interaction.editReply("User is not verified.");
    return;
  }

  try {
    // Note: noblox.js doesn't have a direct "group ban" as Roblox doesn't have a native group ban feature.
    // Usually this means exiling and potentially adding to a blacklist. 
    // For now, we will exile as the primary action.
    await noblox.exile(Number(process.env.ROBLOX_GROUP_ID || 35143702), Number(targetDbUser.robloxId));
    await interaction.editReply(`Successfully banned (exiled) ${targetUser.username} from the Roblox group.`);
  } catch (err) {
    await interaction.editReply("Failed to ban user from the group.");
  }
}

async function handleModeration(interaction: ChatInputCommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.KickMembers)) {
    await interaction.reply({ content: "No permission.", ephemeral: true });
    return;
  }

  const target = interaction.options.getUser("user", true);
  const reason = interaction.options.getString("reason") || "No reason provided";
  const command = interaction.commandName;

  try {
    const member = await interaction.guild?.members.fetch(target.id);
    if (!member) return;

    if (command === "kick") {
      await target.send(`Kicked for: ${reason}`).catch(() => {});
      await member.kick(reason);
    } else if (command === "ban") {
      await target.send(`Banned for: ${reason}`).catch(() => {});
      await member.ban({ reason });
    } else if (command === "timeout") {
      const mins = interaction.options.getInteger("minutes", true);
      await member.timeout(mins * 60 * 1000, reason);
    } else if (command === "warn") {
      await target.send(`Warned for: ${reason}`).catch(() => {});
    }

    await storage.logModeration({ userId: target.id, moderatorId: interaction.user.id, type: command, reason });
    await interaction.reply(`${command}ed ${target.username}.`);
  } catch (err) {
    await interaction.reply({ content: "Error executing command.", ephemeral: true });
  }
}
