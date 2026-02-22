import { type Message, PermissionFlagsBits } from "discord.js";
import { storage } from "../storage";
import { logToChannel } from "./logger";

const SWEAR_WORDS = ["fuck", "shit", "bitch", "asshole", "dick", "pussy"]; // Basic list, user can expand
const EXTREME_PROFANITIES = ["nigger", "faggot", "retard"]; // Extreme list for kicks

const userViolations = new Map<string, number[]>(); // userId -> timestamps of violations

export async function handleAutoMod(message: Message) {
  if (!message.guild || message.author.bot) return;

  const member = await message.guild.members.fetch(message.author.id);
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return;

  const content = message.content.toLowerCase();
  
  // 1. Emoji check (> 6)
  // Simple regex for common emojis that doesn't require 'u' flag if we use standard unicode ranges
  const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;
  const emojiMatch = message.content.match(emojiRegex) || [];
  let emojiCount = 0;
  for (const match of emojiMatch) {
      // Each surrogate pair is roughly one emoji character
      emojiCount += match.length / 2;
  }
  if (emojiCount > 6) {
    await logToChannel(message, "Auto-Mod: Emoji Spam", `Deleted message from ${message.author.tag} for exceeding emoji limit (${emojiCount} emojis).\nContent: ${message.content}`, 0xFFA500);
    await message.delete().catch(() => {});
    return;
  }

  // 2. Extreme profanity check (Kick + Delete)
  const hasExtreme = EXTREME_PROFANITIES.some(word => content.includes(word));
  if (hasExtreme) {
    await logToChannel(message, "Auto-Mod: Extreme Profanity", `Deleted message and kicked ${message.author.tag} for extreme profanity.\nContent: ${message.content}`, 0xFF0000);
    await message.delete().catch(() => {});
    try {
      await message.author.send("You have been kicked for using extreme profanity.").catch(() => {});
      await member.kick("Extreme profanity - Auto-Mod");
      await storage.logModeration({
        userId: message.author.id,
        moderatorId: message.client.user!.id,
        type: "kick",
        reason: "Extreme profanity - Auto-Mod"
      });
    } catch (e) {}
    return;
  }

  // 3. Regular swear word check (> 3)
  const words = content.split(/\s+/);
  const swearCount = words.filter(word => SWEAR_WORDS.some(s => word.includes(s))).length;
  
  if (swearCount > 3) {
    await logToChannel(message, "Auto-Mod: Swearing", `Deleted message from ${message.author.tag} for excessive swearing (${swearCount} words).\nContent: ${message.content}`, 0xFFA500);
    await message.delete().catch(() => {});
    await recordViolation(message);
    return;
  }
}

async function recordViolation(message: Message) {
  const userId = message.author.id;
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  if (!userViolations.has(userId)) {
    userViolations.set(userId, []);
  }

  const violations = userViolations.get(userId)!;
  violations.push(now);

  // Clean old violations
  const recentViolations = violations.filter(v => now - v < oneHour);
  userViolations.set(userId, recentViolations);

  if (recentViolations.length >= 3) {
    try {
      const member = await message.guild!.members.fetch(userId);
      await logToChannel(message, "Auto-Mod: Repeat Violation Ban", `Banned ${message.author.tag} for 3 days due to 3 swearing violations in 1 hour.`, 0x8B0000);
      await message.author.send("You have been banned for 3 days for repeated profanity violations.").catch(() => {});
      await member.ban({ reason: "Repeated profanity violations (3 in 1 hour)", deleteMessageSeconds: 0 });
      
      // Note: Replit storage doesn't have an automated unban. 
      // In a real bot we'd need a scheduler. For now we log it.
      await storage.logModeration({
        userId: userId,
        moderatorId: message.client.user!.id,
        type: "ban",
        reason: "Repeated profanity violations (3 in 1 hour)"
      });
      
      userViolations.delete(userId);
    } catch (e) {}
  }
}
