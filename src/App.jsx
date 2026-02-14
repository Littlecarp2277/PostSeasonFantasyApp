import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Plus, Trophy, LogOut, Copy, Check, X, Search, Filter, Settings, TrendingUp } from 'lucide-react';

const ROSTER_STRUCTURE = {
 QB: 2,
 WR: 4,
 RB: 4,
 TE: 2,
 DEF: 1,
 K: 1
};

// PRODUCTION API CONFIG - Uncomment when deployed to Vercel
const API_BASE_URL = 'https://nfl-api-proxy.vercel.app/api';

// Calculate fantasy points based on position-specific scoring
const calculateFantasyPoints = (player) => {
 let points = 0;
 
 // Passing yards scoring - 0.025 per yard for all positions
 points += (player.passingYards || 0) * 0.025;
 
 // Common scoring for all positions
 points += (player.rushingYards || 0) * 0.1;
 points += (player.receivingYards || 0) * 0.1;
 points += (player.receptions || 0) * 1.0;
 points += (player.passingTDs || 0) * 4.0;
 points += (player.rushingTDs || 0) * 6.0;
 points += (player.receivingTDs || 0) * 6.0;
 points -= (player.fumbles || 0) * 2.0;
 points -= (player.interceptions || 0) * 2.0;
 
 // Position-specific scoring
 if (player.position === 'K') {
 points += (player.extraPointsMade || 0) * 1.0;
 points += (player.fieldGoalsMade || 0) * 3.0;
 }
 
 if (player.position === 'DEF') {
 points += (player.sacks || 0) * 2.0;
 points += (player.defInterceptions || 0) * 2.0;
 points -= (player.touchdownsAllowed || 0) * 3.0;
 points -= Math.floor((player.yardsAllowed || 0) / 150) * 3.0;
 }
 
 return Math.round(points * 10) / 10; // Round to 1 decimal
};

// STATIC DATABASE - Remove when using live API
const STATIC_PLAYERS = [
 // Top Quarterbacks
 {
 id: 'qb1', name: 'Lamar Jackson', position: 'QB', team: 'BAL', gamesPlayed: 16,
 passAttempts: 372, passCompletions: 264, passingYards: 3787, passingTDs: 36, interceptions: 4,
 rushAttempts: 148, rushingYards: 915, rushingTDs: 4, fumbles: 2,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); },
 lastFiveGames: [
 { week: 17, opponent: 'CLE', passYds: 217, passTDs: 2, int: 0, rushYds: 81, rushTDs: 1 },
 { week: 16, opponent: 'PIT', passYds: 324, passTDs: 5, int: 0, rushYds: 87, rushTDs: 0 },
 { week: 15, opponent: 'NYG', passYds: 281, passTDs: 3, int: 0, rushYds: 63, rushTDs: 0 },
 { week: 14, opponent: 'NYJ', passYds: 177, passTDs: 0, int: 1, rushYds: 39, rushTDs: 0 },
 { week: 13, opponent: 'PHI', passYds: 290, passTDs: 2, int: 0, rushYds: 52, rushTDs: 1 }
 ]
 },
 {
 id: 'qb2', name: 'Josh Allen', position: 'QB', team: 'BUF', gamesPlayed: 16,
 passAttempts: 408, passCompletions: 284, passingYards: 3731, passingTDs: 28, interceptions: 6,
 rushAttempts: 105, rushingYards: 502, rushingTDs: 12, fumbles: 3,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); },
 lastFiveGames: [
 { week: 17, opponent: 'NYJ', passYds: 234, passTDs: 2, int: 0, rushYds: 18, rushTDs: 2 },
 { week: 16, opponent: 'NE', passYds: 182, passTDs: 1, int: 1, rushYds: 52, rushTDs: 1 },
 { week: 15, opponent: 'DET', passYds: 274, passTDs: 2, int: 0, rushYds: 28, rushTDs: 1 },
 { week: 14, opponent: 'LAR', passYds: 296, passTDs: 2, int: 1, rushYds: 33, rushTDs: 0 },
 { week: 13, opponent: 'SF', passYds: 263, passTDs: 2, int: 0, rushYds: 44, rushTDs: 1 }
 ]
 },
 {
 id: 'qb3', name: 'Jalen Hurts', position: 'QB', team: 'PHI', gamesPlayed: 15,
 passAttempts: 386, passCompletions: 268, passingYards: 3498, passingTDs: 22, interceptions: 5,
 rushAttempts: 137, rushingYards: 630, rushingTDs: 14, fumbles: 4,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 {
 id: 'qb4', name: 'Patrick Mahomes', position: 'QB', team: 'KC', gamesPlayed: 16,
 passAttempts: 440, passCompletions: 314, passingYards: 4183, passingTDs: 27, interceptions: 11,
 rushAttempts: 58, rushingYards: 222, rushingTDs: 2, fumbles: 1,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 {
 id: 'qb5', name: 'Joe Burrow', position: 'QB', team: 'CIN', gamesPlayed: 16,
 passAttempts: 470, passCompletions: 341, passingYards: 4028, passingTDs: 35, interceptions: 12,
 rushAttempts: 39, rushingYards: 93, rushingTDs: 3, fumbles: 2,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 {
 id: 'qb6', name: 'Brock Purdy', position: 'QB', team: 'SF', gamesPlayed: 16,
 passAttempts: 444, passCompletions: 308, passingYards: 3864, passingTDs: 31, interceptions: 11,
 rushAttempts: 54, rushingYards: 190, rushingTDs: 4, fumbles: 2,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 {
 id: 'qb7', name: 'Jordan Love', position: 'QB', team: 'GB', gamesPlayed: 15,
 passAttempts: 456, passCompletions: 311, passingYards: 4159, passingTDs: 32, interceptions: 11,
 rushAttempts: 46, rushingYards: 176, rushingTDs: 4, fumbles: 3,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 {
 id: 'qb8', name: 'Jared Goff', position: 'QB', team: 'DET', gamesPlayed: 16,
 passAttempts: 543, passCompletions: 376, passingYards: 4575, passingTDs: 30, interceptions: 12,
 rushAttempts: 33, rushingYards: 51, rushingTDs: 1, fumbles: 1,
 get passingPct() { return ((this.passCompletions / this.passAttempts) * 100).toFixed(1); }
 },
 
 // Top Running Backs
 {
 id: 'rb1', name: 'Saquon Barkley', position: 'RB', team: 'PHI', gamesPlayed: 16,
 rushAttempts: 302, rushingYards: 2005, rushingTDs: 13,
 receptions: 33, receivingYards: 278, receivingTDs: 2, fumbles: 2,
 lastFiveGames: [
 { week: 17, opponent: 'DAL', carries: 22, rushYds: 167, rushTDs: 2, recYds: 19, recTDs: 0, fumbles: 0 },
 { week: 16, opponent: 'WAS', carries: 31, rushYds: 150, rushTDs: 1, recYds: 43, recTDs: 0, fumbles: 0 },
 { week: 15, opponent: 'PIT', carries: 27, rushYds: 124, rushTDs: 0, recYds: 15, recTDs: 0, fumbles: 1 },
 { week: 14, opponent: 'CAR', carries: 28, rushYds: 159, rushTDs: 2, recYds: 32, recTDs: 0, fumbles: 0 },
 { week: 13, opponent: 'BAL', carries: 20, rushYds: 146, rushTDs: 1, recYds: 21, recTDs: 1, fumbles: 0 }
 ]
 },
 {
 id: 'rb2', name: 'Derrick Henry', position: 'RB', team: 'BAL', gamesPlayed: 16,
 rushAttempts: 325, rushingYards: 1921, rushingTDs: 16,
 receptions: 14, receivingYards: 106, receivingTDs: 1, fumbles: 1
 },
 {
 id: 'rb3', name: 'Josh Jacobs', position: 'RB', team: 'GB', gamesPlayed: 15,
 rushAttempts: 288, rushingYards: 1329, rushingTDs: 15,
 receptions: 29, receivingYards: 196, receivingTDs: 1, fumbles: 3
 },
 {
 id: 'rb4', name: 'Jahmyr Gibbs', position: 'RB', team: 'DET', gamesPlayed: 14,
 rushAttempts: 250, rushingYards: 1412, rushingTDs: 12,
 receptions: 52, receivingYards: 517, receivingTDs: 4, fumbles: 1
 },
 {
 id: 'rb5', name: 'Joe Mixon', position: 'RB', team: 'HOU', gamesPlayed: 14,
 rushAttempts: 245, rushingYards: 1106, rushingTDs: 11,
 receptions: 28, receivingYards: 157, receivingTDs: 1, fumbles: 2
 },
 {
 id: 'rb6', name: 'James Cook', position: 'RB', team: 'BUF', gamesPlayed: 16,
 rushAttempts: 197, rushingYards: 1009, rushingTDs: 14,
 receptions: 44, receivingYards: 444, receivingTDs: 2, fumbles: 1
 },
 {
 id: 'rb7', name: 'David Montgomery', position: 'RB', team: 'DET', gamesPlayed: 14,
 rushAttempts: 185, rushingYards: 775, rushingTDs: 12,
 receptions: 30, receivingYards: 279, receivingTDs: 1, fumbles: 0
 },
 {
 id: 'rb8', name: 'Kenneth Walker III', position: 'RB', team: 'SEA', gamesPlayed: 15,
 rushAttempts: 242, rushingYards: 1154, rushingTDs: 11,
 receptions: 20, receivingYards: 137, receivingTDs: 1, fumbles: 2
 },
 {
 id: 'rb9', name: 'Kyren Williams', position: 'RB', team: 'LAR', gamesPlayed: 14,
 rushAttempts: 242, rushingYards: 1144, rushingTDs: 12,
 receptions: 46, receivingYards: 272, receivingTDs: 1, fumbles: 1
 },
 {
 id: 'rb10', name: 'Alvin Kamara', position: 'RB', team: 'NO', gamesPlayed: 15,
 rushAttempts: 217, rushingYards: 1012, rushingTDs: 6,
 receptions: 48, receivingYards: 425, receivingTDs: 2, fumbles: 2
 },
 
 // Top Wide Receivers
 {
 id: 'wr1', name: 'Ja\'Marr Chase', position: 'WR', team: 'CIN', gamesPlayed: 16,
 receptions: 100, receivingYards: 1708, receivingTDs: 17, fumbles: 1,
 lastFiveGames: [
 { week: 17, opponent: 'DEN', rec: 11, recYds: 97, recTDs: 1, fumbles: 0 },
 { week: 16, opponent: 'CLE', rec: 14, recYds: 177, recTDs: 3, fumbles: 0 },
 { week: 15, opponent: 'TEN', rec: 10, recYds: 193, recTDs: 2, fumbles: 0 },
 { week: 14, opponent: 'DAL', rec: 6, recYds: 86, recTDs: 1, fumbles: 0 },
 { week: 13, opponent: 'PIT', rec: 8, recYds: 121, recTDs: 2, fumbles: 1 }
 ]
 },
 {
 id: 'wr2', name: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', gamesPlayed: 16,
 receptions: 119, receivingYards: 1263, receivingTDs: 12, fumbles: 0
 },
 {
 id: 'wr3', name: 'Justin Jefferson', position: 'WR', team: 'MIN', gamesPlayed: 16,
 receptions: 103, receivingYards: 1533, receivingTDs: 10, fumbles: 1
 },
 {
 id: 'wr4', name: 'A.J. Brown', position: 'WR', team: 'PHI', gamesPlayed: 13,
 receptions: 67, receivingYards: 1079, receivingTDs: 7, fumbles: 0
 },
 {
 id: 'wr5', name: 'CeeDee Lamb', position: 'WR', team: 'DAL', gamesPlayed: 16,
 receptions: 101, receivingYards: 1194, receivingTDs: 6, fumbles: 1
 },
 {
 id: 'wr6', name: 'Puka Nacua', position: 'WR', team: 'LAR', gamesPlayed: 12,
 receptions: 79, receivingYards: 1018, receivingTDs: 3, fumbles: 0
 },
 {
 id: 'wr7', name: 'Terry McLaurin', position: 'WR', team: 'WAS', gamesPlayed: 16,
 receptions: 82, receivingYards: 1096, receivingTDs: 13, fumbles: 0
 },
 {
 id: 'wr8', name: 'Nico Collins', position: 'WR', team: 'HOU', gamesPlayed: 13,
 receptions: 68, receivingYards: 1008, receivingTDs: 7, fumbles: 1
 },
 {
 id: 'wr9', name: 'George Pickens', position: 'WR', team: 'PIT', gamesPlayed: 16,
 receptions: 71, receivingYards: 1195, receivingTDs: 3, fumbles: 0
 },
 {
 id: 'wr10', name: 'DeVonta Smith', position: 'WR', team: 'PHI', gamesPlayed: 16,
 receptions: 68, receivingYards: 1066, receivingTDs: 7, fumbles: 0
 },
 {
 id: 'wr11', name: 'Mike Evans', position: 'WR', team: 'TB', gamesPlayed: 13,
 receptions: 79, receivingYards: 1004, receivingTDs: 11, fumbles: 1
 },
 {
 id: 'wr12', name: 'Garrett Wilson', position: 'WR', team: 'NYJ', gamesPlayed: 16,
 receptions: 88, receivingYards: 987, receivingTDs: 9, fumbles: 0
 },
 
 // Top Tight Ends
 {
 id: 'te1', name: 'Brock Bowers', position: 'TE', team: 'LV', gamesPlayed: 16,
 receptions: 108, receivingYards: 1194, receivingTDs: 5, fumbles: 1,
 lastFiveGames: [
 { week: 17, opponent: 'NO', rec: 7, recYds: 68, recTDs: 0, fumbles: 0 },
 { week: 16, opponent: 'JAX', rec: 9, recYds: 94, recTDs: 1, fumbles: 0 },
 { week: 15, opponent: 'ATL', rec: 11, recYds: 99, recTDs: 1, fumbles: 0 },
 { week: 14, opponent: 'TB', rec: 6, recYds: 52, recTDs: 0, fumbles: 1 },
 { week: 13, opponent: 'KC', rec: 13, recYds: 126, recTDs: 1, fumbles: 0 }
 ]
 },
 {
 id: 'te2', name: 'George Kittle', position: 'TE', team: 'SF', gamesPlayed: 14,
 receptions: 90, receivingYards: 1106, receivingTDs: 8, fumbles: 0
 },
 {
 id: 'te3', name: 'Trey McBride', position: 'TE', team: 'ARI', gamesPlayed: 16,
 receptions: 96, receivingYards: 1146, receivingTDs: 1, fumbles: 0
 },
 {
 id: 'te4', name: 'Travis Kelce', position: 'TE', team: 'KC', gamesPlayed: 16,
 receptions: 97, receivingYards: 823, receivingTDs: 3, fumbles: 1
 },
 {
 id: 'te5', name: 'Sam LaPorta', position: 'TE', team: 'DET', gamesPlayed: 16,
 receptions: 63, receivingYards: 666, receivingTDs: 9, fumbles: 0
 },
 {
 id: 'te6', name: 'Jonnu Smith', position: 'TE', team: 'MIA', gamesPlayed: 16,
 receptions: 67, receivingYards: 828, receivingTDs: 7, fumbles: 1
 },
 {
 id: 'te7', name: 'Tucker Kraft', position: 'TE', team: 'GB', gamesPlayed: 16,
 receptions: 52, receivingYards: 641, receivingTDs: 8, fumbles: 0
 },
 {
 id: 'te8', name: 'Cade Otton', position: 'TE', team: 'TB', gamesPlayed: 15,
 receptions: 55, receivingYards: 670, receivingTDs: 4, fumbles: 1
 },
 
 // Top Kickers
 {
 id: 'k1', name: 'Justin Tucker', position: 'K', team: 'BAL', gamesPlayed: 16,
 kickAttempts: 32, kicksMade: 29, kicksOver50: 4,
 extraPointsMade: 48, fieldGoalsMade: 29,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); },
 lastFiveGames: [
 { week: 17, opponent: 'CLE', attempts: 2, made: 2, xpMade: 2 },
 { week: 16, opponent: 'PIT', attempts: 3, made: 3, xpMade: 6 },
 { week: 15, opponent: 'NYG', attempts: 1, made: 1, xpMade: 3 },
 { week: 14, opponent: 'NYJ', attempts: 2, made: 1, xpMade: 1 },
 { week: 13, opponent: 'PHI', attempts: 2, made: 2, xpMade: 2 }
 ]
 },
 {
 id: 'k2', name: 'Harrison Butker', position: 'K', team: 'KC', gamesPlayed: 14,
 kickAttempts: 28, kicksMade: 25, kicksOver50: 3,
 extraPointsMade: 42, fieldGoalsMade: 25,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); }
 },
 {
 id: 'k3', name: 'Tyler Bass', position: 'K', team: 'BUF', gamesPlayed: 16,
 kickAttempts: 30, kicksMade: 27, kicksOver50: 2,
 extraPointsMade: 45, fieldGoalsMade: 27,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); }
 },
 {
 id: 'k4', name: 'Jake Elliott', position: 'K', team: 'PHI', gamesPlayed: 16,
 kickAttempts: 26, kicksMade: 23, kicksOver50: 1,
 extraPointsMade: 52, fieldGoalsMade: 23,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); }
 },
 {
 id: 'k5', name: 'Chris Boswell', position: 'K', team: 'PIT', gamesPlayed: 16,
 kickAttempts: 34, kicksMade: 31, kicksOver50: 5,
 extraPointsMade: 38, fieldGoalsMade: 31,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); }
 },
 {
 id: 'k6', name: 'Brandon Aubrey', position: 'K', team: 'DAL', gamesPlayed: 16,
 kickAttempts: 35, kicksMade: 32, kicksOver50: 6,
 extraPointsMade: 40, fieldGoalsMade: 32,
 get kickingPct() { return ((this.kicksMade / this.kickAttempts) * 100).toFixed(1); }
 },
 
 // Top Defenses
 {
 id: 'def1', name: 'Ravens Defense', position: 'DEF', team: 'BAL', gamesPlayed: 16,
 pointsAllowed: 280, yardsAllowed: 4850, sacks: 48, fumbles: 12, defInterceptions: 18, safeties: 1,
 lastFiveGames: [
 { week: 17, opponent: 'CLE', ydsAllowed: 236, sacks: 4, int: 2, fumbles: 1 },
 { week: 16, opponent: 'PIT', ydsAllowed: 289, sacks: 2, int: 1, fumbles: 0 },
 { week: 15, opponent: 'NYG', ydsAllowed: 168, sacks: 5, int: 1, fumbles: 2 },
 { week: 14, opponent: 'NYJ', ydsAllowed: 312, sacks: 1, int: 0, fumbles: 1 },
 { week: 13, opponent: 'PHI', ydsAllowed: 198, sacks: 3, int: 2, fumbles: 1 }
 ]
 },
 {
 id: 'def2', name: 'Eagles Defense', position: 'DEF', team: 'PHI', gamesPlayed: 16,
 pointsAllowed: 298, yardsAllowed: 5020, sacks: 44, fumbles: 10, defInterceptions: 15, safeties: 0
 },
 {
 id: 'def3', name: 'Chiefs Defense', position: 'DEF', team: 'KC', gamesPlayed: 16,
 pointsAllowed: 305, yardsAllowed: 5100, sacks: 42, fumbles: 11, defInterceptions: 16, safeties: 1
 },
 {
 id: 'def4', name: 'Bills Defense', position: 'DEF', team: 'BUF', gamesPlayed: 16,
 pointsAllowed: 315, yardsAllowed: 5200, sacks: 40, fumbles: 9, defInterceptions: 14, safeties: 0
 },
 {
 id: 'def5', name: '49ers Defense', position: 'DEF', team: 'SF', gamesPlayed: 16,
 pointsAllowed: 322, yardsAllowed: 5300, sacks: 45, fumbles: 13, defInterceptions: 17, safeties: 1
 },
 {
 id: 'def6', name: 'Lions Defense', position: 'DEF', team: 'DET', gamesPlayed: 16,
 pointsAllowed: 330, yardsAllowed: 5400, sacks: 38, fumbles: 8, defInterceptions: 12, safeties: 0
 }
];

// Add fantasy points to each player
STATIC_PLAYERS.forEach(player => {
 player.fantasyPoints = calculateFantasyPoints(player);
 player.fantasyPointsPerGame = player.gamesPlayed > 0 
 ? Math.round((player.fantasyPoints / player.gamesPlayed) * 10) / 10 
 : 0;
});

// Calculate salary for each player based on fantasy points and position
const calculatePlayerSalary = (player) => {
 // Position multipliers based on scarcity and value (similar to DraftKings/FanDuel)
 const positionMultipliers = {
 QB: 1.0, // QBs are consistent, standard pricing
 RB: 1.1, // RBs are scarce and valuable
 WR: 1.05, // WRs slightly premium
 TE: 1.0, // TEs standard
 K: 0.6, // Kickers are cheap
 DEF: 0.7 // Defense relatively cheap
 };
 
 const multiplier = positionMultipliers[player.position] || 1.0;
 
 // Base calculation: Fantasy points per game * 100 * position multiplier
 let baseSalary = player.fantasyPointsPerGame * 100 * multiplier;
 
 // Add bonus for elite performers (top tier gets extra value)
 if (player.fantasyPointsPerGame > 20) {
 baseSalary *= 1.15; // Elite tier +15%
 } else if (player.fantasyPointsPerGame > 15) {
 baseSalary *= 1.08; // High tier +8%
 }
 
 // Round to nearest 100
 baseSalary = Math.round(baseSalary / 100) * 100;
 
 // Cap between $1,000 and $15,900
 return Math.max(1000, Math.min(15900, baseSalary));
};

// Add salaries to each player
STATIC_PLAYERS.forEach(player => {
 player.salary = calculatePlayerSalary(player);
});

const LEAGUE_TYPES = {
 BEST_BALL: 'best_ball',
 SALARY_WEEKLY: 'salary_weekly',
 SALARY_POSTSEASON: 'salary_postseason'
};

// Profile picture presets with football warrior themes
const PROFILE_PICTURES = [
 { id: 'gladiator-1', emoji: 'GL', name: 'Gridiron Gladiator', bg: 'from-red-500 to-orange-500' },
 { id: 'spartan-1', emoji: 'SP', name: 'Spartan Striker', bg: 'from-blue-600 to-cyan-500' },
 { id: 'warrior-1', emoji: 'WR', name: 'Thunder Warrior', bg: 'from-yellow-500 to-orange-600' },
 { id: 'knight-1', emoji: 'KN', name: 'Touchdown Knight', bg: 'from-purple-600 to-pink-500' },
 { id: 'viking-1', emoji: 'VK', name: 'Viking Enforcer', bg: 'from-indigo-600 to-blue-500' },
 { id: 'superhero-1', emoji: 'SH', name: 'Gridiron Hero', bg: 'from-green-500 to-emerald-600' },
 { id: 'villain-1', emoji: 'VL', name: 'End Zone Villain', bg: 'from-gray-700 to-gray-900' },
 { id: 'samurai-1', emoji: 'SM', name: 'Samurai Blitzer', bg: 'from-rose-500 to-red-600' },
 { id: 'ninja-1', emoji: 'NJ', name: 'Stealth Runner', bg: 'from-slate-700 to-zinc-800' },
 { id: 'titan-1', emoji: 'TT', name: 'Offensive Titan', bg: 'from-amber-500 to-orange-700' }
];

// Glassmorphic design system styles
const GLASS_STYLES = {
  card: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl",
  cardHover: "hover:bg-white/15 transition-all duration-300",
  modal: "bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl",
  button: "bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all",
  buttonPrimary: "bg-orange-500/90 backdrop-blur-xl hover:bg-orange-500 transition-all",
  input: "bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-400 text-white placeholder:text-white/30",
  badge: "bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-3 py-1"
};

// NFL team colors (hex) for dynamic gradients — primary and secondary
const NFL_TEAM_COLORS = {
  ARI: { primary: '#97233F', secondary: '#FFB612', name: 'Cardinals' },
  ATL: { primary: '#A71930', secondary: '#000000', name: 'Falcons' },
  BAL: { primary: '#241773', secondary: '#9E7C0C', name: 'Ravens' },
  BUF: { primary: '#00338D', secondary: '#C60C30', name: 'Bills' },
  CAR: { primary: '#0085CA', secondary: '#101820', name: 'Panthers' },
  CHI: { primary: '#C83200', secondary: '#0B162A', name: 'Bears' },
  CIN: { primary: '#FB4F14', secondary: '#000000', name: 'Bengals' },
  CLE: { primary: '#311D00', secondary: '#FF3C00', name: 'Browns' },
  DAL: { primary: '#003594', secondary: '#869397', name: 'Cowboys' },
  DEN: { primary: '#FB4F14', secondary: '#002244', name: 'Broncos' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC', name: 'Lions' },
  GB:  { primary: '#203731', secondary: '#FFB612', name: 'Packers' },
  HOU: { primary: '#03202F', secondary: '#A71930', name: 'Texans' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD', name: 'Colts' },
  JAX: { primary: '#006778', secondary: '#D7A22A', name: 'Jaguars' },
  KC:  { primary: '#E31837', secondary: '#FFB81C', name: 'Chiefs' },
  LV:  { primary: '#000000', secondary: '#A5ACAF', name: 'Raiders' },
  LAC: { primary: '#0080C6', secondary: '#FFC20E', name: 'Chargers' },
  LAR: { primary: '#003594', secondary: '#FFA300', name: 'Rams' },
  MIA: { primary: '#008E97', secondary: '#FC4C02', name: 'Dolphins' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F', name: 'Vikings' },
  NE:  { primary: '#002244', secondary: '#C60C30', name: 'Patriots' },
  NO:  { primary: '#101820', secondary: '#D3BC8D', name: 'Saints' },
  NYG: { primary: '#0B2265', secondary: '#A71930', name: 'Giants' },
  NYJ: { primary: '#125740', secondary: '#FFFFFF', name: 'Jets' },
  PHI: { primary: '#004C54', secondary: '#A5ACAF', name: 'Eagles' },
  PIT: { primary: '#101820', secondary: '#FFB612', name: 'Steelers' },
  SF:  { primary: '#AA0000', secondary: '#B3995D', name: 'Niners' },
  SEA: { primary: '#002244', secondary: '#69BE28', name: 'Seahawks' },
  TB:  { primary: '#D50A0A', secondary: '#34302B', name: 'Buccaneers' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB', name: 'Titans' },
  WAS: { primary: '#5A1414', secondary: '#FFB612', name: 'Commanders' }
};

// Fantasy value tier based on points-per-dollar efficiency
const getValueTier = (player) => {
  if (!player) return { label: '—', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  const ppg = player.fantasyPointsPerGame || 0;
  const salary = player.salary || 1;
  const ratio = ppg / (salary / 1000);
  if (ratio > 1.8) return { label: 'ELITE VALUE', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
  if (ratio > 1.2) return { label: 'GREAT VALUE', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' };
  if (ratio > 0.7) return { label: 'SOLID VALUE', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
  return { label: 'OVERPRICED', color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
};

// Get player initials for fallback avatar
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// Position-specific stat configs for the profile modal
const PROFILE_STAT_CONFIGS = {
  QB: [
    { key: 'passingYards', label: 'Pass Yards', icon: '🎯', format: (v) => v?.toLocaleString() },
    { key: 'passingTDs', label: 'Pass TDs', icon: '🏈', format: (v) => v },
    { key: 'interceptions', label: 'INTs', icon: '❌', format: (v) => v },
    { key: 'rushingYards', label: 'Rush Yards', icon: '⚡', format: (v) => v?.toLocaleString() },
    { key: 'rushingTDs', label: 'Rush TDs', icon: '💨', format: (v) => v },
    { key: 'passCompletions', label: 'Completions', icon: '✅', format: (v) => v },
    { key: 'passAttempts', label: 'Attempts', icon: '📊', format: (v) => v },
    { key: 'fumbles', label: 'Fumbles', icon: '⚠️', format: (v) => v },
  ],
  RB: [
    { key: 'rushingYards', label: 'Rush Yards', icon: '⚡', format: (v) => v?.toLocaleString() },
    { key: 'rushingTDs', label: 'Rush TDs', icon: '💨', format: (v) => v },
    { key: 'rushAttempts', label: 'Carries', icon: '🏃', format: (v) => v },
    { key: 'receivingYards', label: 'Rec Yards', icon: '🙌', format: (v) => v?.toLocaleString() },
    { key: 'receivingTDs', label: 'Rec TDs', icon: '🎯', format: (v) => v },
    { key: 'receptions', label: 'Receptions', icon: '🤲', format: (v) => v },
    { key: 'targets', label: 'Targets', icon: '📡', format: (v) => v },
    { key: 'fumbles', label: 'Fumbles', icon: '⚠️', format: (v) => v },
  ],
  WR: [
    { key: 'receivingYards', label: 'Rec Yards', icon: '🚀', format: (v) => v?.toLocaleString() },
    { key: 'receivingTDs', label: 'Rec TDs', icon: '🎯', format: (v) => v },
    { key: 'receptions', label: 'Receptions', icon: '🤲', format: (v) => v },
    { key: 'targets', label: 'Targets', icon: '📡', format: (v) => v },
    { key: 'rushingYards', label: 'Rush Yards', icon: '⚡', format: (v) => v?.toLocaleString() },
    { key: 'rushingTDs', label: 'Rush TDs', icon: '💨', format: (v) => v },
    { key: 'fumbles', label: 'Fumbles', icon: '⚠️', format: (v) => v },
  ],
  TE: [
    { key: 'receivingYards', label: 'Rec Yards', icon: '🙌', format: (v) => v?.toLocaleString() },
    { key: 'receivingTDs', label: 'Rec TDs', icon: '🎯', format: (v) => v },
    { key: 'receptions', label: 'Receptions', icon: '🤲', format: (v) => v },
    { key: 'targets', label: 'Targets', icon: '📡', format: (v) => v },
    { key: 'fumbles', label: 'Fumbles', icon: '⚠️', format: (v) => v },
  ],
  K: [
    { key: 'fieldGoalsMade', label: 'FG Made', icon: '🥅', format: (v) => v },
    { key: 'kickAttempts', label: 'FG Att', icon: '🦶', format: (v) => v },
    { key: 'kicksOver50', label: '50+ Yard', icon: '💪', format: (v) => v },
    { key: 'extraPointsMade', label: 'XP Made', icon: '✅', format: (v) => v },
  ],
  DEF: [
    { key: 'sacks', label: 'Sacks', icon: '💥', format: (v) => v },
    { key: 'defInterceptions', label: 'INTs', icon: '🛡️', format: (v) => v },
    { key: 'pointsAllowed', label: 'Pts Allowed', icon: '🚫', format: (v) => v },
    { key: 'yardsAllowed', label: 'Yds Allowed', icon: '📏', format: (v) => v?.toLocaleString() },
    { key: 'fumbles', label: 'Fum Rec', icon: '🏈', format: (v) => v },
    { key: 'safeties', label: 'Safeties', icon: '🔒', format: (v) => v },
  ],
};

function App() {
 // Storage abstraction with localStorage fallback for mobile
 const storage = {
 async get(key) {
 try {
 if (window.storage?.get) {
 return await window.storage.get(key);
 }
 } catch (err) {
 console.log('Using localStorage fallback for get');
 }
 const value = localStorage.getItem(key);
 return value ? { key, value } : null;
 },
 
 async set(key, value, shared) {
 try {
 if (window.storage?.set) {
 return await window.storage.set(key, value, shared);
 }
 } catch (err) {
 console.log('Using localStorage fallback for set');
 }
 localStorage.setItem(key, value);
 return { key, value };
 },
 
 async delete(key) {
 try {
 if (window.storage?.delete) {
 return await window.storage.delete(key);
 }
 } catch (err) {
 console.log('Using localStorage fallback for delete');
 }
 localStorage.removeItem(key);
 return { key, deleted: true };
 },
 
 async list(prefix) {
 try {
 if (window.storage?.list) {
 return await window.storage.list(prefix);
 }
 } catch (err) {
 console.log('Using localStorage fallback for list');
 }
 const keys = [];
 for (let i = 0; i < localStorage.length; i++) {
 const key = localStorage.key(i);
 if (!prefix || key.startsWith(prefix)) {
 keys.push(key);
 }
 }
 return { keys };
 }
 };

 const [currentUser, setCurrentUser] = useState(null);
 const [screen, setScreen] = useState('auth');
 const [activeTab, setActiveTab] = useState('dashboard'); // New: for dashboard navigation
 const [authMode, setAuthMode] = useState('login');
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [leagues, setLeagues] = useState([]);
 const [currentLeague, setCurrentLeague] = useState(null);
 const [leagueName, setLeagueName] = useState('');
 const [showPlayerModal, setShowPlayerModal] = useState(false);
 const [roster, setRoster] = useState([]);
 const [copied, setCopied] = useState(false);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(true);
 const [players, setPlayers] = useState([]);
 const [loadingPlayers, setLoadingPlayers] = useState(false);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterPosition, setFilterPosition] = useState('ALL');
 const [sortBy, setSortBy] = useState('points'); // points, recent, name
 const [selectedPlayer, setSelectedPlayer] = useState(null);
 const [selectedTeamView, setSelectedTeamView] = useState(null);
 const [leagueType, setLeagueType] = useState(null);
 const [showLeagueTypeModal, setShowLeagueTypeModal] = useState(false);
 const [remainingBudget, setRemainingBudget] = useState(50000);
 // Player Profile Modal state
 const [showProfileModal, setShowProfileModal] = useState(false);
 const [profilePlayer, setProfilePlayer] = useState(null);
 const [profileTab, setProfileTab] = useState('overview');
 const [playerNews, setPlayerNews] = useState([]);
 const [loadingNews, setLoadingNews] = useState(false);
 const [headshotError, setHeadshotError] = useState(false);
 const [showSettingsModal, setShowSettingsModal] = useState(false);
 const [teamName, setTeamName] = useState('');
 const [teamMotto, setTeamMotto] = useState('');
 const [profilePicture, setProfilePicture] = useState('gladiator-1');

 useEffect(() => {
 initializeApp();
 }, []);

 const initializeApp = async () => {
 try {
 const storedUser = await storage.get('current_user');
 if (storedUser && storedUser.value) {
 const user = JSON.parse(storedUser.value);
 setCurrentUser(user);
 await loadUserData(user.id);
 setScreen('league_selection');
 }
 setLoading(false);
 } catch (err) {
 setLoading(false);
 }
 };

 const loadUserData = async (userId) => {
 try {
 const userLeaguesKey = `user_leagues:${userId}`;
 const userLeagues = await storage.get(userLeaguesKey);
 if (userLeagues && userLeagues.value) {
 setLeagues(JSON.parse(userLeagues.value));
 }
 } catch (err) {
 console.error('Error loading user data:', err);
 }
 };

 // Adds computed display fields that JSON responses can't carry (getter functions)
const addComputedFields = (player) => {
  if (player.passAttempts && player.passCompletions) {
    player.passingPct = ((player.passCompletions / player.passAttempts) * 100).toFixed(1);
  }
  if (player.kickAttempts && player.kicksMade) {
    player.kickingPct = ((player.kicksMade / player.kickAttempts) * 100).toFixed(1);
  }
};
 
 // All 32 NFL teams for parallel fetching
 const ALL_NFL_TEAMS = [
   'ARI','ATL','BAL','BUF','CAR','CHI','CIN','CLE',
   'DAL','DEN','DET','GB','HOU','IND','JAX','KC',
   'LV','LAC','LAR','MIA','MIN','NE','NO','NYG',
   'NYJ','PHI','PIT','SF','SEA','TB','TEN','WAS'
 ];

 const fetchNFLPlayers = async () => {
  setLoadingPlayers(true);
  setError('');

  try {
    const cacheKey = 'nfl_players_all_teams_v3';
    const cacheTimeKey = 'nfl_players_all_teams_time_v3';

    const cachedData = await storage.get(cacheKey);
    const cachedTime = await storage.get(cacheTimeKey);

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (cachedData?.value && cachedTime?.value) {
      const cacheAge = now - parseInt(cachedTime.value);
      if (cacheAge < oneHour) {
        const cached = JSON.parse(cachedData.value);
        console.log('Loaded from cache:', cached.length, 'players');
        cached.forEach(addComputedFields);
        setPlayers(cached);
        setLoadingPlayers(false);
        return;
      }
    }

    console.log('Fetching all 32 NFL teams in parallel...');

    // Fetch each team individually — runs in parallel, avoids Vercel timeout
    const allPlayers = [];
    let successCount = 0;

    const results = await Promise.allSettled(
      ALL_NFL_TEAMS.map(async (team) => {
        const res = await fetch(`${API_BASE_URL}/players?team=${team}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
        return [];
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        allPlayers.push(...result.value);
        successCount++;
      }
    }

    console.log(`Fetched ${allPlayers.length} players from ${successCount}/${ALL_NFL_TEAMS.length} teams`);

    if (allPlayers.length > 0) {
      // Sort by fantasy points descending
      allPlayers.sort((a, b) => (b.fantasyPoints || 0) - (a.fantasyPoints || 0));
      // Add computed percentage fields that can't come through JSON
      allPlayers.forEach(addComputedFields);
      await storage.set(cacheKey, JSON.stringify(allPlayers));
      await storage.set(cacheTimeKey, now.toString());
      setPlayers(allPlayers);
    } else {
      throw new Error('No player data returned from any team');
    }
    setLoadingPlayers(false);
  } catch (err) {
    console.warn('API fetch failed, falling back to static data:', err.message);
    // Fallback to static database if API is down
    setPlayers(STATIC_PLAYERS);
    setLoadingPlayers(false);
  }
};

 // ═══════════════════════════════════════════════════════════════
 // PLAYER PROFILE MODAL — open/close + news fetching
 // ═══════════════════════════════════════════════════════════════

 const openPlayerProfile = (player) => {
   if (!player) return;
   // Enrich player with espnId/headshot from full players list if missing
   // (roster data saved before these fields were added won't have them)
   let enriched = player;
   if (!player.espnId || !player.headshot) {
     const match = players.find(p => p.id === player.id || (p.name === player.name && p.team === player.team));
     if (match) {
       enriched = { ...player, espnId: match.espnId || player.espnId, headshot: match.headshot || player.headshot };
     }
   }
   setProfilePlayer(enriched);
   setProfileTab('overview');
   setShowProfileModal(true);
   setHeadshotError(false);
   setPlayerNews([]);
   // Fetch news in background
   if (enriched.espnId) {
     fetchPlayerNews(enriched.espnId);
   }
 };

 const closePlayerProfile = () => {
   setShowProfileModal(false);
   setProfilePlayer(null);
   setPlayerNews([]);
 };

 const fetchPlayerNews = async (espnId) => {
   setLoadingNews(true);
   try {
     const res = await fetch(`${API_BASE_URL}/news?athlete=${espnId}`);
     if (!res.ok) throw new Error('News fetch failed');
     const data = await res.json();
     if (data.success && data.articles) {
       setPlayerNews(data.articles);
     }
   } catch (err) {
     console.warn('Could not fetch player news:', err.message);
     setPlayerNews([]);
   } finally {
     setLoadingNews(false);
   }
 };

 // Get player's fantasy rank among all players at their position
 const getPositionRank = (player) => {
   if (!player) return 0;
   const samePosPlayers = players
     .filter(p => p.position === player.position)
     .sort((a, b) => (b.fantasyPoints || 0) - (a.fantasyPoints || 0));
   return samePosPlayers.findIndex(p => p.id === player.id) + 1;
 };

 // ═══════════════════════════════════════════════════════════════
 // PLAYER PROFILE MODAL — Component
 // ═══════════════════════════════════════════════════════════════

 const PlayerProfileModal = () => {
   if (!showProfileModal || !profilePlayer) return null;

   const player = profilePlayer;
   const teamColors = NFL_TEAM_COLORS[player.team] || { primary: '#1e293b', secondary: '#475569' };
   const valueTier = getValueTier(player);
   const posRank = getPositionRank(player);
   const initials = getInitials(player.name);
   const isOnRoster = roster.some(r => r?.id === player.id);
   const statConfig = PROFILE_STAT_CONFIGS[player.position] || [];

   // Get the stat source based on active tab
   const getStats = () => {
     if (profileTab === 'postseason' && player.postseason) return player.postseason;
     return player;
   };
   const stats = getStats();

   return (
     <div
       className="fixed inset-0 z-[60] flex items-center justify-center p-4"
       onClick={closePlayerProfile}
       style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
     >
       <div
         className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl"
         onClick={(e) => e.stopPropagation()}
         style={{
           background: 'linear-gradient(180deg, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.99) 100%)',
           backdropFilter: 'blur(40px)',
           animation: 'modalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
         }}
       >
         {/* ── Gradient Header with Team Colors ─────────────── */}
         <div
           className="relative overflow-hidden rounded-t-3xl"
           style={{
             background: `linear-gradient(135deg, ${teamColors.primary} 0%, ${teamColors.secondary} 100%)`,
             minHeight: '180px'
           }}
         >
           {/* Decorative pattern overlay */}
           <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
               backgroundSize: '40px 40px'
             }}
           />

           {/* Close button */}
           <button
             onClick={closePlayerProfile}
             className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all z-10"
           >
             <X className="w-5 h-5 text-white/80" />
           </button>

           {/* Team logo watermark */}
           <img
             src={`https://a.espncdn.com/i/teamlogos/nfl/500/${player.team.toLowerCase()}.png`}
             alt=""
             className="absolute right-4 bottom-2 w-20 h-20 opacity-20"
             onError={(e) => { e.target.style.display = 'none'; }}
           />

           {/* Player headshot / avatar */}
           <div className="flex justify-center pt-6 pb-2">
             {player.headshot && !headshotError ? (
               <div className="relative">
                 <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl"
                   style={{ background: `linear-gradient(135deg, ${teamColors.primary}88, ${teamColors.secondary}88)` }}
                 >
                   <img
                     src={player.headshot}
                     alt={player.name}
                     className="w-full h-full object-cover"
                     onError={() => setHeadshotError(true)}
                   />
                 </div>
                 {player.isPlayoffTeam && (
                   <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-yellow-500 text-black text-[9px] font-bold rounded-full shadow-lg">
                     PLAYOFFS
                   </div>
                 )}
               </div>
             ) : (
               <div
                 className="w-28 h-28 rounded-2xl flex items-center justify-center border-2 border-white/20 shadow-xl text-4xl font-bold text-white/80"
                 style={{ background: `linear-gradient(135deg, ${teamColors.primary}cc, ${teamColors.secondary}cc)` }}
               >
                 {initials}
               </div>
             )}
           </div>
         </div>

         {/* ── Player Info ──────────────────────────────────── */}
         <div className="px-6 pt-5 pb-3">
           <div className="flex items-start justify-between">
             <div>
               <h2 className="text-2xl font-bold text-white">{player.name}</h2>
               <div className="flex items-center gap-2 mt-1.5">
                 <span className="text-sm text-white/50">{player.team}</span>
                 <span className="text-white/20">·</span>
                 <span className="text-sm px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
                   {player.position}
                 </span>
               </div>
             </div>
             <div className="text-right">
               <div className="text-xs text-white/40">Rank</div>
               <div className="text-3xl font-bold text-white">#{posRank}</div>
             </div>
           </div>

           {/* Value tier + salary row */}
           <div className="flex items-center gap-3 mt-4">
             <div
               className="px-3 py-1.5 rounded-xl text-xs font-bold border"
               style={{ color: valueTier.color, backgroundColor: valueTier.bg, borderColor: valueTier.color + '33' }}
             >
               {valueTier.label}
             </div>
             <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
               ${player.salary?.toLocaleString()} salary
             </div>
             <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60">
               {player.gamesPlayed} GP
             </div>
           </div>
         </div>

         {/* ── Tab Navigation ──────────────────────────────── */}
         <div className="flex px-6 gap-1 mt-2 border-b border-white/10">
           {[
             { id: 'overview', label: 'Overview' },
             { id: 'stats', label: 'Full Stats' },
             { id: 'postseason', label: 'Postseason' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setProfileTab(tab.id)}
               className={`px-4 py-3 text-sm font-medium transition-all relative ${
                 profileTab === tab.id
                   ? 'text-white'
                   : 'text-white/40 hover:text-white/60'
               }`}
             >
               {tab.label}
               {profileTab === tab.id && (
                 <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: teamColors.primary }} />
               )}
             </button>
           ))}
         </div>

         {/* ── Tab Content ─────────────────────────────────── */}
         <div className="px-6 py-5">

           {/* OVERVIEW TAB */}
           {profileTab === 'overview' && (
             <div>
               {/* Key stat cards — top 5 stats as glassmorphic cards */}
               <div className="grid grid-cols-2 gap-3">
                 {statConfig.slice(0, 4).map(cfg => (
                   <div
                     key={cfg.key}
                     className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 transition-all"
                   >
                     <div className="flex items-center gap-2 mb-2">
                       <span className="text-lg">{cfg.icon}</span>
                       <span className="text-[11px] text-white/40 uppercase tracking-wide">{cfg.label}</span>
                     </div>
                     <div className="text-2xl font-bold text-white">
                       {cfg.format(stats[cfg.key] || 0)}
                     </div>
                   </div>
                 ))}
               </div>

               {/* Fantasy points highlight */}
               <div
                 className="mt-4 p-4 rounded-2xl border border-white/10"
                 style={{ background: `linear-gradient(135deg, ${teamColors.primary}15, ${teamColors.secondary}15)` }}
               >
                 <div className="flex items-center justify-between">
                   <div>
                     <div className="text-xs text-white/40 mb-1">Total Fantasy Points</div>
                     <div className="text-3xl font-bold text-white">{(stats.fantasyPoints || 0).toFixed(1)}</div>
                   </div>
                   <div className="text-right">
                     <div className="text-xs text-white/40 mb-1">Per Game</div>
                     <div className="text-3xl font-bold" style={{ color: teamColors.primary === '#000000' ? teamColors.secondary : teamColors.primary }}>
                       {(stats.fantasyPointsPerGame || 0).toFixed(1)}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}

           {/* FULL STATS TAB */}
           {profileTab === 'stats' && (
             <div className="space-y-2">
               {statConfig.map(cfg => (
                 <div
                   key={cfg.key}
                   className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all"
                 >
                   <div className="flex items-center gap-3">
                     <span className="text-base">{cfg.icon}</span>
                     <span className="text-sm text-white/70">{cfg.label}</span>
                   </div>
                   <span className="text-sm font-bold text-white">{cfg.format(player[cfg.key] || 0)}</span>
                 </div>
               ))}
               <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                 <div className="flex items-center gap-3">
                   <span className="text-base">🏟️</span>
                   <span className="text-sm text-white/70">Games Played</span>
                 </div>
                 <span className="text-sm font-bold text-white">{player.gamesPlayed || 0}</span>
               </div>
               <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                 <div className="flex items-center gap-3">
                   <span className="text-base">⭐</span>
                   <span className="text-sm font-medium text-orange-400">Fantasy Points</span>
                 </div>
                 <span className="text-sm font-bold text-orange-400">{(player.fantasyPoints || 0).toFixed(1)}</span>
               </div>
             </div>
           )}

           {/* POSTSEASON TAB */}
           {profileTab === 'postseason' && (
             <div>
               {player.postseason ? (
                 <div className="space-y-3">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="text-sm font-bold text-green-400">Playoff Stats Available</span>
                     <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs text-green-400">
                       {player.postseason.gamesPlayed || 0} games
                     </span>
                   </div>
                   {statConfig.map(cfg => {
                     const regVal = player[cfg.key] || 0;
                     const psVal = player.postseason[cfg.key] || 0;
                     const perGameReg = player.gamesPlayed > 0 ? regVal / player.gamesPlayed : 0;
                     const perGamePS = player.postseason.gamesPlayed > 0 ? psVal / player.postseason.gamesPlayed : 0;
                     const diff = perGamePS - perGameReg;
                     const diffPct = perGameReg > 0 ? ((diff / perGameReg) * 100).toFixed(0) : 0;

                     return (
                       <div key={cfg.key} className="p-3 rounded-xl bg-white/5 border border-white/5">
                         <div className="flex items-center justify-between mb-1">
                           <div className="flex items-center gap-2">
                             <span className="text-base">{cfg.icon}</span>
                             <span className="text-sm text-white/70">{cfg.label}</span>
                           </div>
                           {diff !== 0 && perGameReg > 0 && (
                             <span className={`text-xs font-medium ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                               {diff > 0 ? '↑' : '↓'} {Math.abs(diffPct)}% per game
                             </span>
                           )}
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="flex-1">
                             <div className="text-[10px] text-white/30 mb-0.5">Regular</div>
                             <div className="text-sm font-bold text-white/60">{cfg.format(regVal)}</div>
                           </div>
                           <div className="text-white/20">→</div>
                           <div className="flex-1">
                             <div className="text-[10px] text-green-400/60 mb-0.5">Playoffs</div>
                             <div className="text-sm font-bold text-white">{cfg.format(psVal)}</div>
                           </div>
                         </div>
                       </div>
                     );
                   })}
                   <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                     <div className="flex items-center justify-between">
                       <span className="text-sm font-medium text-green-400">Playoff Fantasy Points</span>
                       <span className="text-lg font-bold text-green-400">{(player.postseason.fantasyPoints || 0).toFixed(1)}</span>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="text-4xl mb-3">🏈</div>
                   <div className="text-white/40 text-sm">No postseason stats yet</div>
                   <div className="text-white/20 text-xs mt-1">
                     {player.isPlayoffTeam ? 'Playoff games haven\'t started' : 'Team did not make playoffs'}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>

         {/* ── News Section ────────────────────────────────── */}
         <div className="px-6 pb-4">
           <div className="border-t border-white/10 pt-4">
             <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
               📰 Latest News
               {loadingNews && <span className="text-xs text-white/30 animate-pulse">Loading...</span>}
             </h3>
             {playerNews.length > 0 ? (
               <div className="space-y-2">
                 {playerNews.map((article, idx) => (
                   <a
                     key={idx}
                     href={article.link || '#'}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="block p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/8 transition-all"
                   >
                     <div className="text-sm text-white/80 font-medium leading-snug">{article.headline}</div>
                     {article.published && (
                       <div className="text-[10px] text-white/30 mt-1">
                         {new Date(article.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </div>
                     )}
                   </a>
                 ))}
               </div>
             ) : !loadingNews ? (
               <div className="text-xs text-white/20 text-center py-4">No recent news available</div>
             ) : null}
           </div>
         </div>

         {/* ── Action Button ───────────────────────────────── */}
         <div className="px-6 pb-6">
           <button
             onClick={(e) => {
               e.stopPropagation();
               if (isOnRoster) {
                 removePlayerFromRoster(player.id);
                 closePlayerProfile();
               } else {
                 addPlayerToRoster(player);
                 closePlayerProfile();
               }
             }}
             className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all ${
               isOnRoster
                 ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                 : 'text-white border border-white/10 hover:border-white/20'
             }`}
             style={!isOnRoster ? {
               background: `linear-gradient(135deg, ${teamColors.primary}dd, ${teamColors.secondary}dd)`
             } : undefined}
           >
             {isOnRoster ? '✕  Remove from Roster' : '＋  Add to Roster'}
           </button>
         </div>
       </div>

       {/* Modal animation keyframes */}
       <style>{`
         @keyframes modalSlideUp {
           from { opacity: 0; transform: translateY(40px) scale(0.97); }
           to { opacity: 1; transform: translateY(0) scale(1); }
         }
       `}</style>
     </div>
   );
 };

 const handleAuth = async (e) => {
 if (e) e.preventDefault();
 setError('');

 if (!email || !password) {
 setError('Please fill in all fields');
 return;
 }

 // Validate email format
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if (!emailRegex.test(email)) {
 setError('Please enter a valid email address');
 return;
 }

 if (authMode === 'signup') {
 const userId = `user_${Date.now()}`;
 const user = { id: userId, email };
 
 console.log('Attempting signup for:', email);
 
 // Check if user already exists
 try {
 const existingUser = await storage.get(`user:${email}`);
 if (existingUser && existingUser.value) {
 setError('Email already registered. Please log in instead.');
 return;
 }
 } catch (checkErr) {
 // User doesn't exist, continue
 }
 
 // Try each storage operation individually and catch errors
 let saveSuccess = false;
 
 try {
 await storage.set(`user:${email}`, JSON.stringify({ ...user, password }));
 saveSuccess = true;
 } catch (err) {
 console.log('User save error (may be harmless):', err.message);
 // Continue anyway - the error might be about response format, not actual failure
 saveSuccess = true;
 }
 
 try {
 await storage.set('current_user', JSON.stringify(user));
 } catch (err) {
 console.log('Current user save error (may be harmless):', err.message);
 }
 
 try {
 await storage.set(`user_leagues:${userId}`, JSON.stringify([]));
 } catch (err) {
 console.log('Leagues save error (may be harmless):', err.message);
 }
 
 // Even if there were "Invalid response format" errors, the data might have been saved
 // Let's verify by trying to read it back
 try {
 const verifyUser = await storage.get(`user:${email}`);
 if (verifyUser && verifyUser.value) {
 console.log('Signup successful - data verified!');
 setCurrentUser(user);
 setScreen('league_selection');
 } else {
 setError('Failed to create account. Please try again.');
 }
 } catch (verifyErr) {
 // If we can't verify, assume it worked if saveSuccess is true
 if (saveSuccess) {
 console.log('Proceeding with signup despite verification error');
 setCurrentUser(user);
 setScreen('league_selection');
 } else {
 setError('Failed to create account. Please refresh and try again.');
 }
 }
 } else {
 // Login mode
 try {
 const storedUser = await storage.get(`user:${email}`);
 
 if (!storedUser || !storedUser.value) {
 setError('User not found. Please sign up first.');
 return;
 }
 
 const userData = JSON.parse(storedUser.value);
 if (userData.password === password) {
 const user = { id: userData.id, email: userData.email };
 
 try {
 await storage.set('current_user', JSON.stringify(user));
 } catch (err) {
 console.log('Login save error (may be harmless):', err.message);
 }
 
 setCurrentUser(user);
 await loadUserData(user.id);
 setScreen('league_selection');
 } else {
 setError('Invalid password');
 }
 } catch (loginErr) {
 console.error('Login error:', loginErr);
 setError('User not found. Please sign up first.');
 }
 }
 };

 const handleCreateLeague = async () => {
 if (!leagueName.trim()) {
 setError('Please enter a league name');
 return;
 }

 // Show league type selection modal
 setShowLeagueTypeModal(true);
 };

 const createLeagueWithType = async (selectedType) => {
 console.log('Creating league with type:', selectedType);
 try {
 const leagueId = `league_${Date.now()}`;
 const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
 
 console.log('League ID:', leagueId, 'Invite:', inviteCode);
 
 // Create AI team names and IDs
 const aiTeamNames = [
 'GridironGuru',
 'TouchdownTitan',
 'BlitzMaster',
 'EndZoneElite',
 'PlayoffPro'
 ];

 const aiTeamIds = aiTeamNames.map((name, idx) => `ai_team_${leagueId}_${idx}`);
 
 const league = {
 id: leagueId,
 name: leagueName,
 adminId: currentUser.id,
 inviteCode,
 members: [currentUser.id, ...aiTeamIds],
 createdAt: Date.now(),
 leagueType: selectedType
 };

 console.log('Saving league...');
 await storage.set(`league:${leagueId}`, JSON.stringify(league));
 
 console.log('Creating AI teams...');
 // Create AI teams with random rosters
 for (let i = 0; i < aiTeamNames.length; i++) {
 const aiTeamId = aiTeamIds[i];
 const aiEmail = `${aiTeamNames[i]}@ai.fantasy`;
 
 // Store AI user data
 await storage.set(`user:${aiEmail}`, JSON.stringify({
 id: aiTeamId,
 email: aiEmail,
 password: 'ai_team',
 isAI: true
 }));
 
 // Generate random roster for AI team
 const aiRoster = selectedType === LEAGUE_TYPES.BEST_BALL 
 ? generateRandomRoster() 
 : generateRandomSalaryRoster();
 await storage.set(`roster:${aiTeamId}:${leagueId}`, JSON.stringify(aiRoster));
 }
 
 console.log('Updating user leagues...');
 const updatedLeagues = [...leagues, league];
 setLeagues(updatedLeagues);
 await storage.set(`user_leagues:${currentUser.id}`, JSON.stringify(updatedLeagues));
 
 console.log('Creating user roster...');
 await storage.set(`roster:${currentUser.id}:${leagueId}`, JSON.stringify([]));
 
 setCurrentLeague(league);
 setLeagueName('');
 setShowLeagueTypeModal(false);
 
 // Set remaining budget for salary leagues
 if (selectedType !== LEAGUE_TYPES.BEST_BALL) {
 setRemainingBudget(50000);
 }
 
 console.log('League created successfully!');
 setScreen('team');
 } catch (err) {
 console.error('League creation error:', err);
 console.error('Error message:', err.message);
 console.error('Error stack:', err.stack);
 setError(`Failed to create league: ${err.message}`);
 }
 };

 // Generate random roster for AI teams
 const generateRandomRoster = () => {
 const availablePlayers = [...STATIC_PLAYERS];
 const roster = [];
 
 // Shuffle players
 for (let i = availablePlayers.length - 1; i > 0; i--) {
 const j = Math.floor(Math.random() * (i + 1));
 [availablePlayers[i], availablePlayers[j]] = [availablePlayers[j], availablePlayers[i]];
 }
 
 // Fill roster according to structure
 Object.entries(ROSTER_STRUCTURE).forEach(([position, slots]) => {
 const positionPlayers = availablePlayers.filter(p => p.position === position);
 for (let i = 0; i < slots && i < positionPlayers.length; i++) {
 roster.push(positionPlayers[i]);
 }
 });
 
 return roster;
 };

 // Generate random roster for AI teams with salary constraints
 const generateRandomSalaryRoster = () => {
 let availablePlayers = [...STATIC_PLAYERS].sort(() => Math.random() - 0.5);
 const roster = [];
 let budget = 50000;
 
 // Fill roster according to structure while staying under budget
 Object.entries(ROSTER_STRUCTURE).forEach(([position, slots]) => {
 const positionPlayers = availablePlayers.filter(p => p.position === position);
 
 for (let i = 0; i < slots; i++) {
 // Find a player we can afford
 const affordablePlayers = positionPlayers.filter(p => 
 p.salary <= budget && !roster.includes(p)
 );
 
 if (affordablePlayers.length > 0) {
 // Randomly pick from affordable options
 const player = affordablePlayers[Math.floor(Math.random() * affordablePlayers.length)];
 roster.push(player);
 budget -= player.salary;
 }
 }
 });
 
 return roster;
 };

 const handleJoinLeague = async (code) => {
 try {
 const leaguesData = await storage.list('league:');
 
 for (const key of leaguesData.keys) {
 const leagueData = await storage.get(key);
 if (leagueData && leagueData.value) {
 const league = JSON.parse(leagueData.value);
 if (league.inviteCode === code.toUpperCase()) {
 if (!league.members.includes(currentUser.id)) {
 league.members.push(currentUser.id);
 await storage.set(key, JSON.stringify(league));
 
 const updatedLeagues = [...leagues, league];
 setLeagues(updatedLeagues);
 await storage.set(`user_leagues:${currentUser.id}`, JSON.stringify(updatedLeagues));
 
 await storage.set(`roster:${currentUser.id}:${league.id}`, JSON.stringify([]));
 }
 
 setCurrentLeague(league);
 setScreen('team');
 return;
 }
 }
 }
 
 setError('Invalid invite code');
 } catch (err) {
 setError('Failed to join league');
 }
 };

 const loadRoster = async (leagueId) => {
 try {
 const rosterData = await storage.get(`roster:${currentUser.id}:${leagueId}`);
 if (rosterData && rosterData.value) {
 setRoster(JSON.parse(rosterData.value));
 } else {
 setRoster([]);
 }
 } catch (err) {
 setRoster([]);
 }
 };

 const selectLeague = async (league) => {
 setCurrentLeague(league);
 await loadRoster(league.id);
 await loadTeamName(league.id);
 
 // Calculate remaining budget for salary leagues
 if (league.leagueType !== LEAGUE_TYPES.BEST_BALL) {
 const rosterData = await storage.get(`roster:${currentUser.id}:${league.id}`);
 const currentRoster = rosterData && rosterData.value ? JSON.parse(rosterData.value) : [];
 const spent = currentRoster.reduce((sum, p) => sum + (p.salary || 0), 0);
 setRemainingBudget(50000 - spent);
 }
 
 setScreen('team');
 };

 const addPlayerToRoster = async (player) => {
 const positionCount = roster.filter(p => p.position === player.position).length;
 const maxForPosition = ROSTER_STRUCTURE[player.position];

 if (positionCount >= maxForPosition) {
 setError(`Maximum ${maxForPosition} ${player.position} players allowed`);
 setTimeout(() => setError(''), 3000);
 return;
 }

 if (roster.some(p => p.id === player.id)) {
 setError('Player already on roster');
 setTimeout(() => setError(''), 3000);
 return;
 }

 // Check salary cap for salary leagues
 if (currentLeague?.leagueType !== LEAGUE_TYPES.BEST_BALL) {
 const currentSpent = roster.reduce((sum, p) => sum + (p.salary || 0), 0);
 const newTotal = currentSpent + player.salary;
 
 if (newTotal > 50000) {
 setError(`Cannot afford ${player.name}! Over budget by $${(newTotal - 50000).toLocaleString()}`);
 setTimeout(() => setError(''), 3000);
 return;
 }
 
 setRemainingBudget(50000 - newTotal);
 }

 const updatedRoster = [...roster, player];
 setRoster(updatedRoster);
 await storage.set(`roster:${currentUser.id}:${currentLeague.id}`, JSON.stringify(updatedRoster));
 setError('');
 setSelectedPlayer(null);
 };

 const removePlayerFromRoster = async (playerId) => {
 const updatedRoster = roster.filter(p => p.id !== playerId);
 setRoster(updatedRoster);
 await storage.set(`roster:${currentUser.id}:${currentLeague.id}`, JSON.stringify(updatedRoster));
 
 // Update budget for salary leagues
 if (currentLeague?.leagueType !== LEAGUE_TYPES.BEST_BALL) {
 const currentSpent = updatedRoster.reduce((sum, p) => sum + (p.salary || 0), 0);
 setRemainingBudget(50000 - currentSpent);
 }
 };

 const saveTeamName = async () => {
 if (!teamName.trim()) {
 setError('Please enter a team name');
 return;
 }

 try {
 // Save team settings to storage
 const teamSettings = {
 name: teamName,
 motto: teamMotto,
 profilePicture: profilePicture
 };
 await storage.set(`team_settings:${currentUser.id}:${currentLeague.id}`, JSON.stringify(teamSettings));
 setShowSettingsModal(false);
 setError('');
 } catch (err) {
 console.log('Error saving team settings:', err);
 // Ignore "Invalid response format" error
 setShowSettingsModal(false);
 setError('');
 }
 };

 const loadTeamName = async (leagueId) => {
 try {
 const savedSettings = await storage.get(`team_settings:${currentUser.id}:${leagueId}`);
 if (savedSettings && savedSettings.value) {
 const settings = JSON.parse(savedSettings.value);
 setTeamName(settings.name || '');
 setTeamMotto(settings.motto || '');
 setProfilePicture(settings.profilePicture || 'gladiator-1');
 } else {
 setTeamName('');
 setTeamMotto('');
 setProfilePicture('gladiator-1');
 }
 } catch (err) {
 setTeamName('');
 setTeamMotto('');
 setProfilePicture('gladiator-1');
 }
 };

 const copyInviteLink = () => {
 const link = `${window.location.origin}?invite=${currentLeague.inviteCode}`;
 navigator.clipboard.writeText(link);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 const handleLogout = async () => {
 await storage.delete('current_user');
 setCurrentUser(null);
 setLeagues([]);
 setCurrentLeague(null);
 setRoster([]);
 setScreen('auth');
 };

 const openPlayerModal = () => {
 setShowPlayerModal(true);
 setSearchTerm('');
 setFilterPosition('ALL');
 if (players.length === 0) {
 fetchNFLPlayers();
 }
 };

 const filteredPlayers = players.filter(player => {
 const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 player.team.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesPosition = filterPosition === 'ALL' || player.position === filterPosition;
 return matchesSearch && matchesPosition;
 }).sort((a, b) => {
 if (sortBy === 'points') {
 return b.fantasyPoints - a.fantasyPoints;
 } else if (sortBy === 'recent') {
 return (b.fantasyPointsPerGame || 0) - (a.fantasyPointsPerGame || 0);
 } else if (sortBy === 'name') {
 return a.name.localeCompare(b.name);
 }
 return 0;
 });

 useEffect(() => {
 const urlParams = new URLSearchParams(window.location.search);
 const inviteCode = urlParams.get('invite');
 if (inviteCode && currentUser && screen === 'league_selection') {
 handleJoinLeague(inviteCode);
 }
 }, [currentUser, screen]);

 const getTotalFantasyPoints = () => {
 return roster.reduce((total, player) => total + player.fantasyPoints, 0).toFixed(1);
 };

 const loadLeagueRosters = async () => {
 if (!currentLeague) return [];
 
 try {
 console.log('Loading league rosters for:', currentLeague.name);
 console.log('Members:', currentLeague.members);
 
 // Parallelize ALL storage operations for maximum speed
 const [userListResult, ...rosterResults] = await Promise.all([
 storage.list('user:'),
 ...currentLeague.members.map(memberId => 
 storage.get(`roster:${memberId}:${currentLeague.id}`)
 )
 ]);
 
 console.log('User list result:', userListResult);
 console.log('Roster results count:', rosterResults.length);
 
 // Build user cache from the list result
 const userCache = {};
 for (const key of userListResult.keys) {
 try {
 const userData = await storage.get(key);
 if (userData && userData.value) {
 const user = JSON.parse(userData.value);
 userCache[user.id] = user.isAI ? user.email.split('@')[0] : user.email;
 }
 } catch (err) {
 // Skip invalid entries
 }
 }
 
 console.log('User cache:', userCache);
 
 // Process all rosters
 const leagueRosters = currentLeague.members.map((memberId, index) => {
 const rosterData = rosterResults[index];
 const memberRoster = rosterData && rosterData.value ? JSON.parse(rosterData.value) : [];
 const totalPoints = memberRoster.reduce((sum, player) => sum + player.fantasyPoints, 0);
 
 return {
 userId: memberId,
 userEmail: userCache[memberId] || memberId,
 roster: memberRoster,
 totalPoints: totalPoints.toFixed(1)
 };
 });
 
 console.log('League rosters loaded:', leagueRosters.length, 'teams');
 
 // Sort by total points descending
 return leagueRosters.sort((a, b) => parseFloat(b.totalPoints) - parseFloat(a.totalPoints));
 } catch (err) {
 console.error('Error loading league rosters:', err);
 return [];
 }
 };

 // Team Tab Component
 // Dashboard Component - Analytics Overview
 function DashboardView() {
 const [statToggle, setStatToggle] = useState('TDs'); // 'TDs' or 'Yards'
 const [infoPopup, setInfoPopup] = useState(null); // Track which info popup is open

 // Info popup content for each tile
 const tileInfo = {
 lastGames: {
 title: "Last 3 Games Performance",
 description: "This chart shows your fantasy point trends over your most recent 5 games. Use it to identify hot streaks, momentum shifts, and overall scoring patterns. The average line helps you see if you're trending up or down heading into playoffs."
 },
 matchups: {
 title: "Upcoming Matchups",
 description: "Preview your next 5 opponents to plan ahead for tough weeks. Use this to strategize trades, waiver wire moves, or roster adjustments before facing particularly strong opponents."
 },
 teamStats: {
 title: "Team Stats Breakdown",
 description: "Toggle between TDs and Yards to see how your team generates points. A balanced attack across passing, rushing, and receiving makes you less predictable and harder to game plan against."
 },
 efficiency: {
 title: "Lineup Efficiency Score",
 description: "Measures what percentage of your optimal weekly score you actually achieved. High efficiency (90%+) means you're consistently starting the right players. Low efficiency reveals you're leaving points on the bench - review your lineup decisions!"
 },
 consistency: {
 title: "Consistency Rating (Coefficient of Variation)",
 description: "Lower scores (0-10) mean reliable, steady production - ideal for playoffs when you need a safe floor. Higher scores (10+) indicate boom/bust players - high ceiling but risky. Consistent teams win championships!"
 },
 positional: {
 title: "Positional Advantage Index",
 description: "Compares each position group to your league average. Green (+%) means that position is a strength. Red (-%) reveals weaknesses. Use this to identify where to target waiver pickups or trades to shore up weak spots."
 }
 };
 
 const InfoPopup = ({ info, onClose }) => (
 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 rounded-3xl" onClick={onClose}>
 <div className="bg-white rounded-3xl p-6 max-w-md shadow-sm" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-blue-500 flex items-center justify-center flex-shrink-0">
 <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <h3 className="text-lg font-semibold text-white">{info.title}</h3>
 </div>
 <button onClick={onClose} className="rounded-3xl text-white/40 hover:text-white/50">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <p className="text-white/50 leading-relaxed">{info.description}</p>
 </div>
 </div>
 );
 
 // Calculate last 5 games data for line chart
 const last5GamesData = [
 { week: 'Week 13', points: 145.2 },
 { week: 'Week 14', points: 162.8 },
 { week: 'Week 15', points: 138.5 },
 { week: 'Week 16', points: 171.3 },
 { week: 'Week 17', points: 155.7 }
 ];
 
 const avgPoints = (last5GamesData.reduce((sum, g) => sum + g.points, 0) / last5GamesData.length).toFixed(1);
 
 // Mock next 5 matchups
 const upcomingMatchups = [
 { week: 18, date: 'Jan 4', opponent: 'AI Team Alpha', teamEmoji: '🤖' },
 { week: 19, date: 'Jan 11', opponent: 'AI Team Beta', teamEmoji: '⚡' },
 { week: 20, date: 'Jan 18', opponent: 'AI Team Gamma', teamEmoji: '🔥' },
 { week: 21, date: 'Jan 25', opponent: 'AI Team Delta', teamEmoji: '💎' },
 { week: 22, date: 'Feb 1', opponent: 'AI Team Omega', teamEmoji: '👑' }
 ];
 
 // Calculate TD/Yards breakdown
 const tdStats = {
 passing: 12.4,
 rushing: 5.8,
 receiving: 8.2
 };
 
 const yardStats = {
 passing: 1850,
 rushing: 680,
 receiving: 920
 };
 
 const currentStats = statToggle === 'TDs' ? tdStats : yardStats;
 const total = Object.values(currentStats).reduce((a, b) => a + b, 0);
 
 return (
 <>
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-8">
 <div className="max-w-[1400px] mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-5xl font-light text-white mb-2">Dashboard</h1>
 <p className="text-white/50">Your team performance at a glance</p>
 </div>

 {/* Dashboard Grid */}
 <div className="grid grid-cols-12 gap-6">
 {/* Line Graph - Last 3 Games */}
 <div className="col-span-12 lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-light text-white mb-1">Points Per Week</h2>
 <p className="text-sm text-white/50">Last 5 games performance</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <div className="text-3xl font-black text-orange-500">{avgPoints}</div>
 <div className="text-xs text-white/40">Avg Points</div>
 </div>
 <button 
 onClick={() => setInfoPopup('lastGames')}
 className="w-10 h-10 rounded-full bg-white/60 hover:bg-white/5 backdrop-blur-sm flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>
 </div>

 {/* Simple Line Chart Visualization */}
 <div className="relative h-64">
 <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
 {/* Grid lines */}
 <line x1="0" y1="50" x2="500" y2="50" stroke="#ffffff15" strokeWidth="1"/>
 <line x1="0" y1="100" x2="500" y2="100" stroke="#ffffff15" strokeWidth="1"/>
 <line x1="0" y1="150" x2="500" y2="150" stroke="#ffffff15" strokeWidth="1"/>
 
 {/* Line path */}
 <path
 d="M 25 120 L 125 80 L 225 140 L 325 40 L 425 90"
 fill="none"
 stroke="#ff6b35"
 strokeWidth="3"
 strokeLinecap="round"
 strokeLinejoin="round"
 />
 
 {/* Area under curve */}
 <path
 d="M 25 120 L 125 80 L 225 140 L 325 40 L 425 90 L 425 200 L 25 200 Z"
 fill="url(#gradient)"
 opacity="0.3"
 />
 
 {/* Data points */}
 <circle cx="25" cy="120" r="4" fill="#ff6b35" stroke="#1f2937" strokeWidth="2"/>
 <circle cx="125" cy="80" r="4" fill="#ff6b35" stroke="#1f2937" strokeWidth="2"/>
 <circle cx="225" cy="140" r="4" fill="#ff6b35" stroke="#1f2937" strokeWidth="2"/>
 <circle cx="325" cy="40" r="4" fill="#ff6b35" stroke="#1f2937" strokeWidth="2"/>
 <circle cx="425" cy="90" r="4" fill="#ff6b35" stroke="#1f2937" strokeWidth="2"/>
 
 <defs>
 <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
 <stop offset="0%" stopColor="#10b981" stopOpacity="0.4"/>
 <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
 </linearGradient>
 </defs>
 </svg>
 
 {/* X-axis labels */}
 <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-white/40">
 {last5GamesData.map((game, idx) => (
 <span key={idx} className="text-center">{game.week.replace('Week ', 'W')}</span>
 ))}
 </div>
 </div>

 {/* Stats row */}
 <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
 <div className="text-center">
 <div className="text-sm text-white/40 mb-1">Highest</div>
 <div className="text-xl font-light text-white">{Math.max(...last5GamesData.map(g => g.points)).toFixed(1)}</div>
 </div>
 <div className="text-center">
 <div className="text-sm text-white/40 mb-1">Lowest</div>
 <div className="text-xl font-light text-white">{Math.min(...last5GamesData.map(g => g.points)).toFixed(1)}</div>
 </div>
 <div className="text-center">
 <div className="text-sm text-white/40 mb-1">Trend</div>
 <div className="text-xl font-light text-green-400">↗ +13.4</div>
 </div>
 </div>
 </div>

 {/* Calendar - Next 5 Matchups */}
 <div className="col-span-12 lg:col-span-5 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-light text-white">Upcoming Matchups</h2>
 <div className="flex items-center gap-2">
 <span className="text-xs text-white/50 bg-white/5 px-4 py-2 rounded-full">Next 5</span>
 <button 
 onClick={() => setInfoPopup('matchups')}
 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>
 </div>

 <div className="space-y-3">
 {upcomingMatchups.map((matchup, idx) => (
 <div 
 key={idx}
 className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/5 rounded-3xl transition-all cursor-pointer group"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-xl shadow-sm">
 {matchup.teamEmoji}
 </div>
 <div className="flex-1">
 <div className="font-semibold text-white group-hover:text-orange-400 transition-colors">
 {matchup.opponent}
 </div>
 <div className="text-xs text-white/50">Week {matchup.week} • {matchup.date}</div>
 </div>
 </div>
 <svg className="w-5 h-5 text-white/40 group-hover:text-orange-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 ))}
 </div>
 </div>

 {/* Team Stats - Pie Chart with Toggle */}
 <div className="col-span-12 lg:col-span-5 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <div className="flex items-center gap-2">
 <h2 className="text-xl font-light text-white">Team Stats</h2>
 <button 
 onClick={() => setInfoPopup('teamStats')}
 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>
 <div className="flex gap-1 bg-white/5 rounded-3xl p-4">
 <button
 onClick={() => setStatToggle('TDs')}
 className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
 statToggle === 'TDs' 
 ? 'bg-white text-orange-400 shadow-sm' 
 : 'text-white/50 hover:text-white'
 }`}
 >
 TDs
 </button>
 <button
 onClick={() => setStatToggle('Yards')}
 className={`px-4 py-1.5 rounded-2xl text-sm font-semibold transition-all ${
 statToggle === 'Yards' 
 ? 'bg-white text-orange-400 shadow-sm' 
 : 'text-white/50 hover:text-white'
 }`}
 >
 Yards
 </button>
 </div>
 </div>

 {/* Pie Chart */}
 <div className="rounded-2xl relative flex items-center justify-center h-64">
 <svg className="w-48 h-48" viewBox="0 0 200 200">
 {/* Passing - Cyan */}
 <circle
 cx="100"
 cy="100"
 r="70"
 fill="none"
 stroke="#06b6d4"
 strokeWidth="40"
 strokeDasharray={`${(currentStats.passing / total) * 440} 440`}
 strokeDashoffset="0"
 transform="rotate(-90 100 100)"
 />
 {/* Rushing - Green */}
 <circle
 cx="100"
 cy="100"
 r="70"
 fill="none"
 stroke="#ff6b35"
 strokeWidth="40"
 strokeDasharray={`${(currentStats.rushing / total) * 440} 440`}
 strokeDashoffset={`-${(currentStats.passing / total) * 440}`}
 transform="rotate(-90 100 100)"
 />
 {/* Receiving - Purple */}
 <circle
 cx="100"
 cy="100"
 r="70"
 fill="none"
 stroke="#ff6b35"
 strokeWidth="40"
 strokeDasharray={`${(currentStats.receiving / total) * 440} 440`}
 strokeDashoffset={`-${((currentStats.passing + currentStats.rushing) / total) * 440}`}
 transform="rotate(-90 100 100)"
 />
 
 {/* Center value */}
 <text x="100" y="95" textAnchor="middle" className="text-3xl font-black" fill="white">
 {total.toFixed(0)}
 </text>
 <text x="100" y="115" textAnchor="middle" className="text-sm" fill="rgba(255,255,255,0.5)">
 {statToggle === 'TDs' ? 'TDs/Week' : 'Yards/Week'}
 </text>
 </svg>
 </div>

 {/* Legend */}
 <div className="grid grid-cols-3 gap-3 mt-6">
 <div className="text-center">
 <div className="w-3 h-3 rounded-full rounded-full bg-cyan-500 mx-auto mb-2"></div>
 <div className="text-xs text-white/50 mb-1">Passing</div>
 <div className="font-semibold text-white">{currentStats.passing.toFixed(1)}</div>
 </div>
 <div className="text-center">
 <div className="w-3 h-3 rounded-full rounded-full bg-green-500 mx-auto mb-2"></div>
 <div className="text-xs text-white/50 mb-1">Rushing</div>
 <div className="font-semibold text-white">{currentStats.rushing.toFixed(1)}</div>
 </div>
 <div className="text-center">
 <div className="w-3 h-3 rounded-full rounded-full bg-orange-500 mx-auto mb-2"></div>
 <div className="text-xs text-white/50 mb-1">Receiving</div>
 <div className="font-semibold text-white">{currentStats.receiving.toFixed(1)}</div>
 </div>
 </div>
 </div>

 {/* Lineup Efficiency Score */}
 <div className="col-span-12 lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-light text-white mb-1">Lineup Efficiency</h2>
 <p className="text-sm text-white/50">Are you starting your best players?</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <div className="text-3xl font-black text-green-500">87.4%</div>
 <div className="text-xs text-white/50">Season Average</div>
 </div>
 <button 
 onClick={() => setInfoPopup('efficiency')}
 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>
 </div>

 <div className="space-y-4">
 {/* Week-by-week efficiency */}
 {[
 { week: 'Week 17', efficiency: 92.1, started: 155.7, optimal: 169.2 },
 { week: 'Week 16', efficiency: 95.8, started: 171.3, optimal: 178.8 },
 { week: 'Week 15', efficiency: 78.3, started: 138.5, optimal: 176.9 },
 { week: 'Week 14', efficiency: 88.6, started: 162.8, optimal: 183.7 },
 { week: 'Week 13', efficiency: 82.4, started: 145.2, optimal: 176.2 }
 ].map((week, idx) => (
 <div key={idx} className="flex items-center gap-4">
 <div className="w-20 text-sm font-semibold text-white/80">{week.week}</div>
 <div className="flex-1">
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs text-white/50">Started: {week.started} pts</span>
 <span className="text-xs text-white/50">Optimal: {week.optimal} pts</span>
 </div>
 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all ${
 week.efficiency >= 90 ? 'bg-gradient-to-r from-green-400 to-green-500' :
 week.efficiency >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
 'bg-gradient-to-r from-red-400 to-red-500'
 }`}
 style={{ width: `${week.efficiency}%` }}
 ></div>
 </div>
 </div>
 <div className={`text-sm font-bold w-12 text-right ${
 week.efficiency >= 90 ? 'text-green-400' :
 week.efficiency >= 80 ? 'text-yellow-600' :
 'text-red-400'
 }`}>
 {week.efficiency}%
 </div>
 </div>
 ))}
 </div>

 <div className="mt-6 p-4 bg-blue-500/10 backdrop-blur-sm">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
 <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <div className="font-semibold text-white mb-1">Tip: Maximize Your Score</div>
 <div className="text-sm text-white/50">
 You left an average of 21.3 points on your bench this season. Review player matchups before setting your lineup!
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Consistency Rating - Coefficient of Variation */}
 <div className="col-span-12 lg:col-span-5 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-light text-white mb-1">Consistency Rating</h2>
 <p className="text-sm text-white/50">Week-to-week scoring stability</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <div className="text-3xl font-black text-green-500">8.2</div>
 <div className="text-xs text-white/50">Coefficient</div>
 </div>
 <button 
 onClick={() => setInfoPopup('consistency')}
 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>
 </div>

 {/* Consistency Score Gauge */}
 <div className="relative mb-6">
 <div className="flex items-center justify-center h-40">
 <div className="relative w-48 h-24 overflow-hidden">
 {/* Semi-circle gauge background */}
 <svg className="w-full h-full" viewBox="0 0 200 100">
 {/* Background arc */}
 <path
 d="M 20 80 A 80 80 0 0 1 180 80"
 fill="none"
 stroke="rgba(255,255,255,0.15)"
 strokeWidth="20"
 strokeLinecap="round"
 />
 {/* Green zone (good consistency - lower is better) */}
 <path
 d="M 20 80 A 80 80 0 0 1 100 20"
 fill="none"
 stroke="#ff6b35"
 strokeWidth="20"
 strokeLinecap="round"
 />
 {/* Yellow zone */}
 <path
 d="M 100 20 A 80 80 0 0 1 180 80"
 fill="none"
 stroke="#f59e0b"
 strokeWidth="20"
 strokeLinecap="round"
 />
 {/* Needle pointer */}
 <line
 x1="100"
 y1="80"
 x2="140"
 y2="50"
 stroke="#1f2937"
 strokeWidth="3"
 strokeLinecap="round"
 />
 <circle cx="100" cy="80" r="6" fill="white" />
 </svg>
 </div>
 </div>
 </div>

 <div className="space-y-3">
 <div className="flex items-center justify-between p-3 bg-green-500/10">
 <div className="flex items-center gap-3">
 <div className="w-3 h-3 rounded-full rounded-full bg-green-500"></div>
 <span className="text-sm font-semibold text-white/80">Low Variance</span>
 </div>
 <span className="text-sm text-green-400 font-bold">0-10: Reliable</span>
 </div>
 <div className="flex items-center justify-between p-3 bg-yellow-500/10">
 <div className="flex items-center gap-3">
 <div className="w-3 h-3 rounded-full rounded-full bg-yellow-500"></div>
 <span className="text-sm font-semibold text-white/80">High Variance</span>
 </div>
 <span className="text-sm text-yellow-600 font-bold">10+: Boom/Bust</span>
 </div>
 </div>

 <div className="mt-4 p-4 bg-green-500/10">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-2xl bg-green-500 flex items-center justify-center flex-shrink-0">
 <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <div className="font-semibold text-white mb-1">Great Consistency!</div>
 <div className="text-sm text-white/50">
 Your team scores consistently each week. This reliability is key for playoff success!
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Positional Advantage Index */}
 <div className="col-span-12 lg:col-span-7 bg-white/5 backdrop-blur-xl rounded-3xl p-8 shadow-md border border-white/10">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h2 className="text-xl font-light text-white mb-1">Positional Advantage</h2>
 <p className="text-sm text-white/50">How your positions compare to league average</p>
 </div>
 <button 
 onClick={() => setInfoPopup('positional')}
 className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
 >
 <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </button>
 </div>

 <div className="space-y-4">
 {/* QB Position */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-sm">
 QB
 </div>
 <div className="flex-1">
 <div className="font-semibold text-white">Quarterback</div>
 <div className="text-xs text-white/50">285.3 pts vs 268.1 avg</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl font-light text-green-400">+6.4%</div>
 <div className="text-xs text-white/50">Above Avg</div>
 </div>
 </div>
 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '56.4%' }}></div>
 </div>
 </div>

 {/* RB Position */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-br from-blue-500/100 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
 RB
 </div>
 <div className="flex-1">
 <div className="font-semibold text-white">Running Back</div>
 <div className="text-xs text-white/50">412.8 pts vs 322.5 avg</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl font-light text-green-400">+28.0%</div>
 <div className="text-xs text-white/50">Above Avg</div>
 </div>
 </div>
 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '78%' }}></div>
 </div>
 </div>

 {/* WR Position */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
 WR
 </div>
 <div className="flex-1">
 <div className="font-semibold text-white">Wide Receiver</div>
 <div className="text-xs text-white/50">298.2 pts vs 355.7 avg</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl font-light text-red-400">-16.2%</div>
 <div className="text-xs text-white/50">Below Avg</div>
 </div>
 </div>
 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: '33.8%' }}></div>
 </div>
 </div>

 {/* TE Position */}
 <div>
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm">
 TE
 </div>
 <div className="flex-1">
 <div className="font-semibold text-white">Tight End</div>
 <div className="text-xs text-white/50">186.4 pts vs 178.9 avg</div>
 </div>
 </div>
 <div className="text-right">
 <div className="text-xl font-light text-green-400">+4.2%</div>
 <div className="text-xs text-white/50">Above Avg</div>
 </div>
 </div>
 <div className="h-3 bg-white/5 rounded-full overflow-hidden">
 <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full" style={{ width: '54.2%' }}></div>
 </div>
 </div>
 </div>

 <div className="mt-6 p-4 bg-orange-500/10 backdrop-blur-sm">
 <div className="flex items-start gap-3">
 <div className="w-8 h-8 rounded-2xl bg-orange-500 flex items-center justify-center flex-shrink-0">
 <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 </div>
 <div>
 <div className="font-semibold text-white mb-1">Action: Target Wide Receivers</div>
 <div className="text-sm text-white/50">
 Your WR position is 16.2% below league average. Focus on waiver wire pickups or trades to strengthen this weakness.
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* Info Popup Modal */}
 {infoPopup && (
 <InfoPopup 
 info={tileInfo[infoPopup]} 
 onClose={() => setInfoPopup(null)} 
 />
 )}
 </>
 );
 }

 function TeamTab() {
 // Position color schemes for visual hierarchy
 const positionColors = {
 QB: { border: 'border-cyan-500', bg: 'from-cyan-500/10 to-blue-500/10', text: 'text-cyan-400', icon: '🎯' },
 RB: { border: 'border-green-500', bg: 'from-green-500/10 to-emerald-500/10', text: 'text-green-400', icon: '⚡' },
 WR: { border: 'border-orange-500', bg: 'from-orange-500/10 to-amber-500/10', text: 'text-orange-400', icon: '🚀' },
 TE: { border: 'border-orange-500', bg: 'from-orange-500/10 to-amber-500/10', text: 'text-orange-400', icon: '🎪' },
 K: { border: 'border-yellow-500', bg: 'from-yellow-500/10 to-amber-500/10', text: 'text-yellow-400', icon: '🎯' },
 DEF: { border: 'border-red-500', bg: 'from-red-500/10 to-rose-500/10', text: 'text-red-400', icon: '🛡️' }
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-6">
 <div className="max-w-7xl mx-auto">
 {/* Header Section with Glass Effect */}
 <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 md:p-8 mb-6 shadow-sm rounded-3xl">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div>
 <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
 My Roster
 </h2>
 <div className="flex items-center gap-4 flex-wrap">
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-cyan-400 rounded-full animate-pulse"></div>
 <span className="text-white/30 text-sm">{roster.length} / {Object.values(ROSTER_STRUCTURE).reduce((a, b) => a + b, 0)} Players</span>
 </div>
 <div className="h-4 w-px bg-white/20"></div>
 <div className="flex items-center gap-2">
 <span className="text-white/40 text-sm">Total Points:</span>
 <span className="text-2xl font-light text-cyan-400">{getTotalFantasyPoints()}</span>
 </div>
 </div>
 </div>
 
 <button
 onClick={openPlayerModal}
 className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-white shadow-md shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-105 transition-all duration-300 rounded-3xl"
 >
 <div className="flex items-center gap-2">
 <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
 <span>Add Players</span>
 </div>
 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity -z-10"></div>
 </button>

 {error && (
 <div className="mt-4 backdrop-blur-sm bg-red-500/10 border border-red-500/30 rounded-3xl p-4">
 <div className="flex items-center gap-2 text-red-400">
 <X className="w-5 h-5" />
 <span className="font-medium">{error}</span>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Roster Grid */}
 <div className="space-y-6">
 {Object.entries(ROSTER_STRUCTURE).map(entry => {
 const position = entry[0];
 const slots = entry[1];
 const positionPlayers = roster.filter(p => p.position === position);
 const positionPoints = positionPlayers.reduce((sum, p) => sum + p.fantasyPoints, 0);
 const colors = positionColors[position];
 const filledSlots = positionPlayers.length;
 const fillPercentage = (filledSlots / slots) * 100;
 
 return (
 <div key={position} className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 shadow-md hover:bg-white/10 transition-all duration-300 rounded-3xl">
 <div className="mb-6">
 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className={`w-12 h-12 rounded-3xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center text-2xl shadow-md`}>
 {colors.icon}
 </div>
 <div>
 <h3 className={`text-2xl font-light ${colors.text}`}>{position}</h3>
 <p className="rounded-3xl text-white/40 text-sm">{filledSlots} of {slots} filled</p>
 </div>
 </div>
 
 <div className="text-right">
 <div className={`text-4xl font-light ${colors.text}`}>
 {positionPoints.toFixed(1)}
 </div>
 <div className="text-xs text-white/40">Total Points</div>
 </div>
 </div>

 {/* Fill Progress Bar */}
 <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
 <div 
 className={`absolute inset-y-0 left-0 rounded-l-3xl bg-gradient-to-r ${colors.bg} ${colors.border} border-r-2 transition-all duration-500`}
 style={{ width: `${fillPercentage}%` }}
 >
 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
 </div>
 </div>
 </div>

 {/* Player Cards Grid */}
 <div className="grid gap-3">
 {Array.from({ length: slots }).map((_, idx) => {
 const player = positionPlayers[idx];
 
 return (
 <div key={idx}>
 <div
 onClick={() => player && openPlayerProfile(player)}
 className={`group relative rounded-3xl transition-all duration-300 ${
 player
 ? `backdrop-blur-sm bg-gradient-to-r ${colors.bg} border-2 ${colors.border} cursor-pointer hover:scale-[1.02] hover:shadow-md hover:border-opacity-100`
 : 'backdrop-blur-sm bg-white/5 border-2 border-dashed border-white/20 hover:border-white/40'
 }`}
 >
 {player ? (
 <div className="p-4">
 <div className="flex items-center justify-between">
 {/* Player Info */}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2">
 <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center text-lg font-bold ${colors.text} shadow-md`}>
 {player.position}
 </div>
 <div className="rounded-3xl flex-1 min-w-0">
 <h4 className="text-lg font-bold text-white truncate">{player.name}</h4>
 <p className="text-sm text-white/40">{player.team}</p>
 </div>
 </div>

 {/* Stats Row */}
 <div className="flex items-center gap-4 flex-wrap">
 <div className="flex items-center gap-2">
 <div className={`px-3 py-1 rounded-2xl bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
 <span className="rounded-2xl text-xs text-white/40 mr-1">Total:</span>
 <span className={`text-sm font-bold ${colors.text}`}>{player.fantasyPoints} pts</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <div className="px-3 py-1 bg-white/5 border border-white/10">
 <span className="text-xs text-white/40 mr-1">Avg:</span>
 <span className="text-sm font-bold text-white">{player.fantasyPointsPerGame}</span>
 </div>
 </div>
 {player.lastFiveGames && (
 <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30">
 <span className="text-xs text-cyan-400 font-medium">📊 Stats Available</span>
 </div>
 )}
 </div>
 </div>

 {/* Actions */}
 <div className="flex items-center gap-2 ml-4">
 <button
 onClick={(e) => {
 e.stopPropagation();
 removePlayerFromRoster(player.id);
 }}
 className="opacity-0 group-hover:opacity-100 p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-2xl transition-all duration-300"
 title="Remove player"
 >
 <X className="w-5 h-5 text-red-400" />
 </button>
 </div>
 </div>

 {/* Hover Glow Effect */}
 <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity -z-10`}></div>
 </div>
 ) : (
 <div className="p-6 text-center">
 <div className="text-white/20 text-sm font-medium">Empty Slot</div>
 <div className="text-white/10 text-xs mt-1">Click "Add Players" to fill</div>
 </div>
 )}
 </div>

 {/* Vibrant Stat Chart for clicked player */}
 {selectedPlayer?.id === player?.id && player?.lastFiveGames && (
 <div className="mt-3 p-6 bg-white rounded-3xl shadow-md border border-orange-500/20 animate-i">
 <div className="flex items-center justify-between mb-6">
 <h4 className="text-xl font-light text-white flex items-center gap-2">
 📊 Performance Chart
 <span className="text-xs font-normal text-purple-300 bg-purple-500/20 px-4 py-2 rounded-full">
 Last 3 Games
 </span>
 </h4>
 <div className="text-right">
 <div className="text-2xl font-light text-cyan-400">{player.fantasyPoints}</div>
 <div className="text-xs text-white/40">Total Points</div>
 </div>
 </div>

 <div className="space-y-2">
 {player.position === 'QB' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-5 gap-2">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Pass Yds</div>
 <div className="text-sm font-semibold text-white">{game.passYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Pass TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.passTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">INT</div>
 <div className="text-sm font-semibold text-red-400">{game.int}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush Yds</div>
 <div className="text-sm font-semibold text-white">{game.rushYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.rushTDs}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'RB' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-6 gap-2">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Carries</div>
 <div className="text-sm font-semibold text-white">{game.carries}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush Yds</div>
 <div className="text-sm font-semibold text-white">{game.rushYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.rushTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec Yds</div>
 <div className="text-sm font-semibold text-white">{game.recYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.recTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-red-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 {(player.position === 'WR' || player.position === 'TE') && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-4 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Receptions</div>
 <div className="text-sm font-semibold text-white">{game.rec}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec Yards</div>
 <div className="text-sm font-semibold text-white">{game.recYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Touchdowns</div>
 <div className="text-sm font-semibold text-orange-500">{game.recTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-red-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'K' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">FG Att</div>
 <div className="text-sm font-semibold text-white">{game.attempts}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">FG Made</div>
 <div className="text-sm font-semibold text-orange-500">{game.made}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Extra Pts</div>
 <div className="text-sm font-semibold text-cyan-400">{game.xpMade}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'DEF' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-4 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Yds Allow</div>
 <div className="text-sm font-semibold text-white">{game.ydsAllowed}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Sacks</div>
 <div className="text-sm font-semibold text-orange-500">{game.sacks}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">INT</div>
 <div className="text-sm font-semibold text-cyan-400">{game.int}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-yellow-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>

 {/* Quick Stats Summary Footer */}
 {roster.length > 0 && (
 <div className="mt-6 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-sm rounded-3xl">
 <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30">
 <div className="text-4xl font-light text-cyan-400">{roster.length}</div>
 <div className="text-xs text-white/40 mt-1">Total Players</div>
 </div>
 <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30">
 <div className="text-4xl font-light text-purple-400">{getTotalFantasyPoints()}</div>
 <div className="text-xs text-white/40 mt-1">Total Points</div>
 </div>
 <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
 <div className="text-4xl font-light text-green-400">
 {roster.length > 0 ? (parseFloat(getTotalFantasyPoints()) / roster.length).toFixed(1) : '0.0'}
 </div>
 <div className="text-xs text-white/40 mt-1">Avg Per Player</div>
 </div>
 <div className="text-center p-4 rounded-3xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/30">
 <div className="text-4xl font-light text-orange-400">
 {Object.values(ROSTER_STRUCTURE).reduce((a, b) => a + b, 0) - roster.length}
 </div>
 <div className="text-xs text-white/40 mt-1">Empty Slots</div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 );
 }

 // Game Week Tab Component
 function GameWeekTab() {
 const [leaderboard, setLeaderboard] = useState([]);
 const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

 useEffect(() => {
 const fetchLeaderboard = async () => {
 setLoadingLeaderboard(true);
 const data = await loadLeagueRosters();
 setLeaderboard(data);
 setLoadingLeaderboard(false);
 };
 fetchLeaderboard();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [currentLeague]);

 if (loadingLeaderboard) {
 return (
 <div className="max-w-6xl mx-auto px-4 py-6">
 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
 </div>
 </div>
 );
 }

 if (selectedTeamView) {
 const team = leaderboard.find(t => t.userId === selectedTeamView);
 if (!team) {
 return (
 <div className="max-w-6xl mx-auto px-4 py-6">
 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-center text-white/50">
 Team not found
 </div>
 </div>
 );
 }
 
 return (
 <div className="max-w-6xl mx-auto px-4 py-6">
 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6">
 <button
 onClick={() => setSelectedTeamView(null)}
 className="mb-4 text-orange-400 hover:text-orange-300 font-medium flex items-center gap-2"
 >
 ← Back to Leaderboard
 </button>
 
 <h2 className="text-2xl font-light text-white mb-2">{team.userEmail}'s Team</h2>
 <p className="text-white/50 mb-6">Total Points: {team.totalPoints}</p>

 <div className="space-y-6">
 {Object.entries(ROSTER_STRUCTURE).map(entry => {
 const position = entry[0];
 const slots = entry[1];
 const positionPlayers = team.roster.filter(p => p.position === position);
 const positionPoints = positionPlayers.reduce((sum, p) => sum + p.fantasyPoints, 0);
 
 return (
 <div key={position} className="border-b border-white/10 pb-4 last:border-b-0">
 <h3 className="font-semibold text-white/80 mb-3 flex items-center gap-2">
 {position}
 <span className="text-xs text-white/50">
 ({positionPlayers.length}/{slots}) • {positionPoints.toFixed(1)} pts
 </span>
 </h3>
 <div className="grid gap-2">
 {Array.from({ length: slots }).map((_, idx) => {
 const player = positionPlayers[idx];
 return (
 <div key={idx}>
 <div
 onClick={() => player && openPlayerProfile(player)}
 className={`p-3 rounded-2xl ${
 player
 ? 'bg-gradient-to-r from-blue-500/10 to-orange-100 border border-blue-200 cursor-pointer hover:shadow-md transition'
 : 'bg-white/5 border border-dashed border-white/20'
 }`}
 >
 {player ? (
 <div className="flex justify-between items-center">
 <div className="flex-1">
 <div className="font-semibold text-white">{player.name}</div>
 <div className="text-xs text-white/50">
 {player.team} • {player.fantasyPoints} pts ({player.fantasyPointsPerGame} avg)
 </div>
 </div>
 <div className="text-sm font-medium text-orange-400">{player.position}</div>
 </div>
 ) : (
 <div className="text-white/40 text-sm">Empty Slot</div>
 )}
 </div>
 
 {/* Stat Chart for clicked player */}
 {selectedPlayer?.id === player?.id && player?.lastFiveGames && (
 <div className="mt-3 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl shadow-md border border-purple-500/2">
 <div className="flex items-center justify-between mb-6">
 <h4 className="text-xl font-light text-white flex items-center gap-2">
 📊 Performance Chart
 <span className="text-xs font-normal text-purple-300 bg-purple-500/20 px-4 py-2 rounded-full">
 Last 3 Games
 </span>
 </h4>
 <div className="text-right">
 <div className="text-2xl font-light text-cyan-400">{player.fantasyPoints}</div>
 <div className="text-xs text-white/40">Total Points</div>
 </div>
 </div>

 <div className="space-y-2">
 {player.position === 'QB' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-5 gap-2">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Pass Yds</div>
 <div className="text-sm font-semibold text-white">{game.passYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Pass TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.passTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">INT</div>
 <div className="text-sm font-semibold text-red-400">{game.int}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush Yds</div>
 <div className="text-sm font-semibold text-white">{game.rushYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.rushTDs}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'RB' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-6 gap-2">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Carries</div>
 <div className="text-sm font-semibold text-white">{game.carries}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush Yds</div>
 <div className="text-sm font-semibold text-white">{game.rushYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rush TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.rushTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec Yds</div>
 <div className="text-sm font-semibold text-white">{game.recYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec TD</div>
 <div className="text-sm font-semibold text-orange-500">{game.recTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-red-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 {(player.position === 'WR' || player.position === 'TE') && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-4 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Receptions</div>
 <div className="text-sm font-semibold text-white">{game.rec}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Rec Yards</div>
 <div className="text-sm font-semibold text-white">{game.recYds}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Touchdowns</div>
 <div className="text-sm font-semibold text-orange-500">{game.recTDs}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-red-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'K' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">FG Att</div>
 <div className="text-sm font-semibold text-white">{game.attempts}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">FG Made</div>
 <div className="text-sm font-semibold text-orange-500">{game.made}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Extra Pts</div>
 <div className="text-sm font-semibold text-cyan-400">{game.xpMade}</div>
 </div>
 </div>
 </div>
 );
 })}
 {player.position === 'DEF' && player.lastFiveGames.slice(0, 3).map((game, gameIdx) => {
 const borderColors = ['border-l-red-500', 'border-l-orange-500', 'border-l-cyan-500', 'border-l-teal-500', 'border-l-yellow-500'];
 const bgColors = ['bg-red-500/5', 'bg-orange-500/5', 'bg-cyan-500/5', 'bg-teal-500/5', 'bg-yellow-500/5'];
 return (
 <div key={gameIdx} className={`backdrop-blur-sm bg-white/5 ${bgColors[gameIdx % 5]} border-l-4 ${borderColors[gameIdx % 5]} rounded-3xl p-4 hover:bg-white/10 transition`}>
 <div className="rounded-3xl flex items-center justify-between mb-3">
 <div className="flex items-center gap-3">
 <div className="text-sm font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1">
 Week {game.week}
 </div>
 <div className="text-sm font-semibold text-white/30">
 vs <span className="text-cyan-400">{game.opponent}</span>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-4 gap-4">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Yds Allow</div>
 <div className="text-sm font-semibold text-white">{game.ydsAllowed}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Sacks</div>
 <div className="text-sm font-semibold text-orange-500">{game.sacks}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">INT</div>
 <div className="text-sm font-semibold text-cyan-400">{game.int}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-1">Fumbles</div>
 <div className="text-sm font-semibold text-yellow-400">{game.fumbles}</div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-8">
 <div className="max-w-[1400px] mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-5xl font-light text-white mb-2">Game Week</h1>
 <p className="text-white/50">League standings and team matchups</p>
 </div>

 {/* Stats Overview Cards */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
 {/* Total Teams Card */}
 <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-md text-white">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 </div>
 </div>
 <div className="text-5xl font-black mb-2">{leaderboard.length}</div>
 <div className="text-orange-100 font-medium">Teams Competing</div>
 </div>

 {/* Highest Score Card */}
 <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 shadow-md text-white">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
 </svg>
 </div>
 </div>
 <div className="text-5xl font-black mb-2">
 {leaderboard.length > 0 ? Math.max(...leaderboard.map(t => parseFloat(t.totalPoints))).toFixed(1) : '0'}
 </div>
 <div className="text-green-100 font-medium">Highest Score</div>
 </div>

 {/* Average Score Card */}
 <div className="bg-gradient-to-br from-blue-500/100 to-blue-600 rounded-3xl p-6 shadow-md text-white">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
 </svg>
 </div>
 </div>
 <div className="text-5xl font-black mb-2">
 {leaderboard.length > 0 
 ? (leaderboard.reduce((sum, t) => sum + parseFloat(t.totalPoints), 0) / leaderboard.length).toFixed(1)
 : '0'}
 </div>
 <div className="text-blue-100 font-medium">League Average</div>
 </div>
 </div>

 {/* Leaderboard */}
 <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-2xl font-light text-white">League Standings</h2>
 <div className="text-sm text-white/50">
 {leaderboard.length} {leaderboard.length === 1 ? 'team' : 'teams'}
 </div>
 </div>
 
 {leaderboard.length === 0 ? (
 <div className="text-center py-12">
 <div className="w-20 h-20 rounded-3xl bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
 <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 </div>
 <p className="text-white/50 font-medium">No teams in this league yet</p>
 <p className="text-sm text-white/40 mt-1">Invite members to join and start competing!</p>
 </div>
 ) : (
 <div className="space-y-3">
 {leaderboard.map((team, index) => (
 <button
 key={team.userId}
 onClick={() => setSelectedTeamView(team.userId)}
 className="w-full p-5 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/30 hover:from-white/10 hover:to-white/20 rounded-3xl transition-all border border-white/10 hover:border-white/20 hover:shadow-md text-left flex items-center gap-4 group"
 >
 {/* Rank Badge */}
 <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-3xl font-black text-2xl shadow-md ${
 index === 0 
 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
 : index === 1
 ? 'bg-gradient-to-br from-white/20 to-white/30 text-white'
 : index === 2
 ? 'bg-gradient-to-br from-orange-300 to-orange-400 text-white'
 : 'bg-gradient-to-br from-white/10 to-white/20 text-white/80'
 }`}>
 {index === 0 ? '🏆' : index + 1}
 </div>
 
 {/* Team Info */}
 <div className="flex-1 min-w-0">
 <div className="font-semibold text-white text-lg mb-1 truncate group-hover:text-orange-400 transition-colors">
 {team.userEmail}
 </div>
 <div className="flex items-center gap-3 text-sm text-white/50">
 <span className="flex items-center gap-1">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 {team.roster.length} players
 </span>
 <span className="text-white/40">•</span>
 <span>Click to view roster</span>
 </div>
 </div>
 
 {/* Points Display */}
 <div className="text-right">
 <div className="text-2xl font-bold text-orange-500 mb-1">
 {team.totalPoints}
 </div>
 <div className="text-xs text-white/50 font-medium uppercase tracking-wide">Total Points</div>
 </div>

 {/* Arrow Icon */}
 <div className="flex-shrink-0">
 <svg className="w-6 h-6 text-white/50 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </button>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
 }

 // Schedule Tab Component
 function ScheduleTab() {
 // Static schedule data - in production, this would come from an NFL API
 const upcomingGames = [
 {
 id: 1,
 homeTeam: 'Kansas City Chiefs',
 awayTeam: 'Buffalo Bills',
 homeTeamAbbr: 'KC',
 awayTeamAbbr: 'BUF',
 date: 'Sun, Jan 26',
 time: '6:30 PM ET',
 homeSpread: '-1.5',
 awaySpread: '+1.5',
 overUnder: '47.5',
 homeMoneyline: '-120',
 awayMoneyline: '+100',
 homeRankings: {
 passOffense: 1,
 runOffense: 14,
 passDefense: 12,
 runDefense: 8
 },
 awayRankings: {
 passOffense: 3,
 runOffense: 10,
 passDefense: 5,
 runDefense: 15
 },
 lastMeeting: {
 date: 'Nov 17, 2024',
 homeTeam: 'BUF',
 homeScore: 30,
 awayScore: 21,
 homePassYards: 262,
 awayPassYards: 196,
 homeRushYards: 182,
 awayRushYards: 78,
 homeTurnovers: 1,
 awayTurnovers: 2
 }
 },
 {
 id: 2,
 homeTeam: 'Philadelphia Eagles',
 awayTeam: 'Washington Commanders',
 homeTeamAbbr: 'PHI',
 awayTeamAbbr: 'WAS',
 date: 'Sun, Jan 26',
 time: '3:00 PM ET',
 homeSpread: '-6.5',
 awaySpread: '+6.5',
 overUnder: '45.5',
 homeMoneyline: '-280',
 awayMoneyline: '+230',
 homeRankings: {
 passOffense: 7,
 runOffense: 1,
 passDefense: 8,
 runDefense: 3
 },
 awayRankings: {
 passOffense: 5,
 runOffense: 24,
 passDefense: 22,
 runDefense: 28
 },
 lastMeeting: {
 date: 'Dec 22, 2024',
 homeTeam: 'PHI',
 homeScore: 41,
 awayScore: 7,
 homePassYards: 221,
 awayPassYards: 143,
 homeRushYards: 229,
 awayRushYards: 32,
 homeTurnovers: 0,
 awayTurnovers: 5
 }
 },
 {
 id: 3,
 homeTeam: 'Detroit Lions',
 awayTeam: 'San Francisco 49ers',
 homeTeamAbbr: 'DET',
 awayTeamAbbr: 'SF',
 date: 'Sat, Jan 25',
 time: '8:00 PM ET',
 homeSpread: '-7.5',
 awaySpread: '+7.5',
 overUnder: '51.5',
 homeMoneyline: '-340',
 awayMoneyline: '+275',
 homeRankings: {
 passOffense: 4,
 runOffense: 5,
 passDefense: 19,
 runDefense: 20
 },
 awayRankings: {
 passOffense: 11,
 runOffense: 6,
 passDefense: 10,
 runDefense: 7
 },
 lastMeeting: null
 },
 {
 id: 4,
 homeTeam: 'Baltimore Ravens',
 awayTeam: 'Houston Texans',
 homeTeamAbbr: 'BAL',
 awayTeamAbbr: 'HOU',
 date: 'Sat, Jan 25',
 time: '4:30 PM ET',
 homeSpread: '-9.5',
 awaySpread: '+9.5',
 overUnder: '44.5',
 homeMoneyline: '-450',
 awayMoneyline: '+350',
 homeRankings: {
 passOffense: 9,
 runOffense: 2,
 passDefense: 4,
 runDefense: 2
 },
 awayRankings: {
 passOffense: 16,
 runOffense: 18,
 passDefense: 14,
 runDefense: 11
 },
 lastMeeting: {
 date: 'Dec 25, 2024',
 homeTeam: 'HOU',
 homeScore: 2,
 awayScore: 31,
 homePassYards: 168,
 awayPassYards: 177,
 homeRushYards: 48,
 awayRushYards: 212,
 homeTurnovers: 1,
 awayTurnovers: 0
 }
 }
 ];

 const getRankColor = (rank) => {
 if (rank <= 10) return 'text-green-400 bg-green-500/10';
 if (rank <= 20) return 'text-yellow-600 bg-yellow-500/10';
 return 'text-red-400 bg-red-500/10';
 };

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-8">
 <div className="max-w-[1400px] mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-5xl font-light text-white mb-2">Schedule</h1>
 <p className="text-white/50">Championship weekend matchups & analysis</p>
 </div>

 <div className="space-y-6">
 {upcomingGames.map((game) => (
 <div key={game.id} className="bg-white/5 backdrop-blur-xl rounded-3xl shadow border border-white/10 overflow-hidden hover:shadow-md transition-al">
 {/* Game Header */}
 <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
 <div className="flex items-center justify-between text-white">
 <div className="flex items-center gap-3">
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <span className="text-lg font-bold">{game.date}</span>
 </div>
 <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-semibold">{game.time}</span>
 </div>
 </div>
 </div>

 <div className="p-6">
 {/* Away Team */}
 <div className="mb-6 pb-6 border-b-2 border-white/10">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/100 to-cyan-600 flex items-center justify-center shadow-sm">
 <span className="font-black text-white text-xl">{game.awayTeamAbbr}</span>
 </div>
 <div>
 <div className="text-2xl font-black text-white">{game.awayTeam}</div>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-sm text-white/50 bg-white/5 px-4 py-2 rounded-full font-medium">Away</span>
 <span className="text-sm text-white/50 bg-blue-500/10 backdrop-blur-sm text-blue-400 px-4 py-2 rounded-full font-medium">{game.awaySpread}</span>
 </div>
 </div>
 </div>
 </div>
 
 {/* Away Team Rankings */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.awayRankings.passOffense)}`}>
 <div className="text-xs font-medium mb-1">Pass Offense</div>
 <div className="text-2xl font-black">#{game.awayRankings.passOffense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.awayRankings.runOffense)}`}>
 <div className="text-xs font-medium mb-1">Run Offense</div>
 <div className="text-2xl font-black">#{game.awayRankings.runOffense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.awayRankings.passDefense)}`}>
 <div className="text-xs font-medium mb-1">Pass Defense</div>
 <div className="text-2xl font-black">#{game.awayRankings.passDefense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.awayRankings.runDefense)}`}>
 <div className="text-xs font-medium mb-1">Run Defense</div>
 <div className="text-2xl font-black">#{game.awayRankings.runDefense}</div>
 </div>
 </div>
 </div>

 {/* VS Badge */}
 <div className="flex justify-center -my-3 mb-6">
 <div className="bg-gradient-to-r from-white/10 to-white/5 text-white font-black px-6 py-2 rounded-full shadow-md text-l">
 VS
 </div>
 </div>

 {/* Home Team */}
 <div className="mb-6">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-sm">
 <span className="font-black text-white text-xl">{game.homeTeamAbbr}</span>
 </div>
 <div>
 <div className="text-2xl font-black text-white">{game.homeTeam}</div>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-sm text-white/50 bg-white/5 px-4 py-2 rounded-full font-medium">Home</span>
 <span className="text-sm text-white/50 bg-orange-500/10 backdrop-blur-sm text-orange-400 px-4 py-2 rounded-full font-medium">{game.homeSpread}</span>
 </div>
 </div>
 </div>
 </div>
 
 {/* Home Team Rankings */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.homeRankings.passOffense)}`}>
 <div className="text-xs font-medium mb-1">Pass Offense</div>
 <div className="text-2xl font-black">#{game.homeRankings.passOffense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.homeRankings.runOffense)}`}>
 <div className="text-xs font-medium mb-1">Run Offense</div>
 <div className="text-2xl font-black">#{game.homeRankings.runOffense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.homeRankings.passDefense)}`}>
 <div className="text-xs font-medium mb-1">Pass Defense</div>
 <div className="text-2xl font-black">#{game.homeRankings.passDefense}</div>
 </div>
 <div className={`p-3 rounded-3xl text-center ${getRankColor(game.homeRankings.runDefense)}`}>
 <div className="text-xs font-medium mb-1">Run Defense</div>
 <div className="text-2xl font-black">#{game.homeRankings.runDefense}</div>
 </div>
 </div>
 </div>

 {/* Betting Lines */}
 <div className="bg-gradient-to-br from-white/5 to-orange-500/10 rounded-3xl p-5 mb-6">
 <div className="flex items-center gap-2 mb-4">
 <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <h3 className="text-lg font-semibold text-white">Betting Lines</h3>
 </div>
 <div className="grid grid-cols-3 gap-4">
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center rounded-3xl">
 <div className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wide">Spread</div>
 <div className="space-y-1">
 <div className="font-semibold text-white">{game.homeTeamAbbr} {game.homeSpread}</div>
 <div className="font-semibold text-white">{game.awayTeamAbbr} {game.awaySpread}</div>
 </div>
 </div>
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center rounded-3xl">
 <div className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wide">Over/Under</div>
 <div className="text-2xl font-black text-orange-400">{game.overUnder}</div>
 </div>
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 text-center rounded-3xl">
 <div className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wide">Moneyline</div>
 <div className="space-y-1">
 <div className="font-semibold text-white">{game.homeTeamAbbr} {game.homeMoneyline}</div>
 <div className="font-semibold text-white">{game.awayTeamAbbr} {game.awayMoneyline}</div>
 </div>
 </div>
 </div>
 </div>

 {/* Last Meeting */}
 {game.lastMeeting && (
 <div className="bg-gradient-to-br from-blue-500/100/10 to-cyan-500/10 rounded-3xl p-5">
 <div className="flex items-center gap-2 mb-4">
 <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <h3 className="text-lg font-semibold text-white">Previous Matchup</h3>
 </div>
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 mb-3 rounded-2xl">
 <div className="text-center mb-3">
 <div className="text-sm text-white/50 mb-2">{game.lastMeeting.date}</div>
 <div className="flex items-center justify-center gap-4">
 <div className="text-right">
 <div className="text-xl font-black text-white">{game.lastMeeting.homeTeam === game.homeTeamAbbr ? game.homeTeamAbbr : game.awayTeamAbbr}</div>
 <div className="text-3xl font-black text-orange-400">{game.lastMeeting.homeScore}</div>
 </div>
 <div className="text-2xl font-light text-white/40">-</div>
 <div className="text-left">
 <div className="text-xl font-black text-white">{game.lastMeeting.homeTeam === game.homeTeamAbbr ? game.awayTeamAbbr : game.homeTeamAbbr}</div>
 <div className="text-3xl font-black text-blue-400">{game.lastMeeting.awayScore}</div>
 </div>
 </div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-2xl">
 <div className="font-semibold text-white mb-2 text-center">
 {game.lastMeeting.homeTeam === game.homeTeamAbbr ? game.homeTeamAbbr : game.awayTeamAbbr}
 </div>
 <div className="space-y-1 text-sm">
 <div className="flex justify-between">
 <span className="text-white/50">Pass Yds:</span>
 <span className="font-semibold text-white">{game.lastMeeting.homePassYards}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-white/50">Rush Yds:</span>
 <span className="font-semibold text-white">{game.lastMeeting.homeRushYards}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-white/50">Turnovers:</span>
 <span className="font-bold text-red-400">{game.lastMeeting.homeTurnovers}</span>
 </div>
 </div>
 </div>
 <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-3 rounded-2xl">
 <div className="font-semibold text-white mb-2 text-center">
 {game.lastMeeting.homeTeam === game.homeTeamAbbr ? game.awayTeamAbbr : game.homeTeamAbbr}
 </div>
 <div className="space-y-1 text-sm">
 <div className="flex justify-between">
 <span className="text-white/50">Pass Yds:</span>
 <span className="font-semibold text-white">{game.lastMeeting.awayPassYards}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-white/50">Rush Yds:</span>
 <span className="font-semibold text-white">{game.lastMeeting.awayRushYards}</span>
 </div>
 <div className="flex justify-between">
 <span className="text-white/50">Turnovers:</span>
 <span className="font-bold text-red-400">{game.lastMeeting.awayTurnovers}</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Disclaimer */}
 <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 border-l-4 border-orange-500">
 <div className="flex items-start gap-3">
 <svg className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <div>
 <p className="font-semibold text-white mb-1">Informational Purposes Only</p>
 <p className="text-sm text-white/50">
 Betting odds and team rankings are provided for fantasy football analysis. 
 Lines are updated daily from major sportsbooks and may vary.
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 // News Tab Component
 function NewsTab() {
 const [newsArticles, setNewsArticles] = useState([]);
 const [loadingNews, setLoadingNews] = useState(true);
 const [lastUpdated, setLastUpdated] = useState(new Date());

 // Static news data - in production, this would come from ESPN API and X API
 const fetchNews = () => {
 // Simulating ESPN NFL news and Adam Schefter X posts
 const mockNews = [
 {
 id: 1,
 title: "Chiefs' Patrick Mahomes embraces underdog role in AFC Championship",
 description: "Kansas City QB says team is motivated by being underdogs for first time in years as they prepare to face Buffalo in what could be an instant classic.",
 source: "ESPN",
 publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString(),
 url: "#",
 image: "https://via.placeholder.com/400x200/1e40af/ffffff?text=NFL+News"
 },
 {
 id: 2,
 title: "Breaking: Lions DE Aidan Hutchinson expected to return for NFC Championship",
 description: "Sources tell ESPN that the star pass rusher has been cleared to play after recovering from his injury, a massive boost for Detroit's defensive line.",
 source: "@AdamSchefter",
 publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toLocaleString(),
 url: "#",
 image: "https://via.placeholder.com/400x200/1DA1F2/ffffff?text=X+Post"
 },
 {
 id: 3,
 title: "Saquon Barkley's historic season propels Eagles to NFC title game",
 description: "The star running back's 2,000+ yard season has been the catalyst for Philadelphia's dominant playoff run, setting franchise records along the way.",
 source: "ESPN",
 publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toLocaleString(),
 url: "#",
 image: "https://via.placeholder.com/400x200/7c3aed/ffffff?text=NFL+News"
 },
 {
 id: 4,
 title: "Bills OC Joe Brady drawing interest for multiple head coaching vacancies",
 description: "Per sources: Brady has interviewed with 4 teams this week. His offensive scheme with Josh Allen has NFL executives taking notice.",
 source: "@AdamSchefter",
 publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toLocaleString(),
 url: "#",
 image: "https://via.placeholder.com/400x200/1DA1F2/ffffff?text=X+Post"
 },
 {
 id: 5,
 title: "Historic playoff performances highlight Championship Weekend preview",
 description: "Breaking down the key matchups, player stats, and storylines heading into the final four teams' quest for Super Bowl glory.",
 source: "ESPN",
 publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toLocaleString(),
 url: "#",
 image: "https://via.placeholder.com/400x200/ea580c/ffffff?text=NFL+News"
 }
 ];

 setNewsArticles(mockNews);
 setLoadingNews(false);
 setLastUpdated(new Date());
 };

 useEffect(() => {
 // Initial fetch
 fetchNews();

 // Auto-refresh every 5 minutes (300000ms)
 const refreshInterval = setInterval(() => {
 fetchNews();
 }, 300000);

 // Cleanup interval on unmount
 return () => clearInterval(refreshInterval);
 }, []);

 if (loadingNews) {
 return (
 <div className="max-w-6xl mx-auto px-4 py-6">
 <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center justify-center">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 px-4 py-8">
 <div className="max-w-[1400px] mx-auto">
 {/* Header */}
 <div className="mb-8">
 <h1 className="text-5xl font-light text-white mb-2">News Feed</h1>
 <p className="text-white/50">Latest NFL updates from ESPN & @AdamSchefter</p>
 </div>

 {/* Stats Bar */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
 <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-md text-white">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
 </svg>
 </div>
 </div>
 <div className="text-5xl font-black mb-2">{newsArticles.length}</div>
 <div className="text-orange-100 font-medium">Breaking Headlines</div>
 </div>

 <div className="bg-gradient-to-br from-blue-500/100 to-blue-600 rounded-3xl p-6 shadow-md text-white">
 <div className="flex items-center justify-between mb-4">
 <div className="w-12 h-12 bg-white/20 flex items-center justify-center">
 <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 </div>
 <div className="text-2xl font-black mb-2">{lastUpdated.toLocaleTimeString()}</div>
 <div className="text-blue-100 font-medium">Last Updated • Auto-refresh 5min</div>
 </div>
 </div>

 {/* News Articles */}
 <div className="space-y-6">
 {newsArticles.map((article, index) => (
 <div 
 key={article.id} 
 className="bg-white/5 backdrop-blur-xl rounded-3xl shadow border border-white/10 overflow-hidden hover:shadow-md transition-all cursor-pointer grou"
 >
 <div className="flex flex-col md:flex-row">
 {/* Article Image/Badge */}
 <div className={`md:w-64 h-48 md:h-auto flex-shrink-0 relative overflow-hidden ${
 article.source === '@AdamSchefter' 
 ? 'bg-gradient-to-br from-blue-500/100 to-blue-700' 
 : 'bg-gradient-to-br from-orange-500 to-orange-700'
 }`}>
 <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
 <div className="text-6xl font-black mb-2 opacity-90">#{index + 1}</div>
 <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full backdrop-blur-sm">
 {article.source === '@AdamSchefter' ? (
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
 <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
 </svg>
 ) : (
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
 </svg>
 )}
 <span className="font-bold text-sm">{article.source}</span>
 </div>
 </div>
 </div>

 {/* Article Content */}
 <div className="flex-1 p-6 md:p-8">
 <div className="mb-4">
 <h3 className="font-black text-white text-2xl md:text-3xl leading-tight mb-3 group-hover:text-orange-400 transition-colors">
 {article.title}
 </h3>
 
 <p className="text-white/50 text-base leading-relaxed">
 {article.description}
 </p>
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <span className={`px-4 py-2 rounded-3xl font-bold text-sm ${
 article.source === '@AdamSchefter'
 ? 'bg-blue-500/10 backdrop-blur-sm text-blue-400 border border-blue-500/30'
 : 'bg-orange-500/10 backdrop-blur-sm text-orange-500 border border-orange-500/30'
 }`}>
 {article.source}
 </span>
 <div className="rounded-2xl flex items-center gap-2 text-sm text-white/50">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 <span className="font-medium">{article.publishedAt}</span>
 </div>
 </div>

 <svg className="w-6 h-6 text-white/50 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>

 {/* Auto-refresh Notice */}
 <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 border-l-4 border-blue-500">
 <div className="flex items-start gap-3">
 <svg className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
 </svg>
 <div>
 <p className="font-semibold text-white mb-1">Auto-Refresh Enabled</p>
 <p className="text-sm text-white/50">
 News updates automatically every 5 minutes. Headlines are pulled from ESPN's NFL coverage and @AdamSchefter on X (formerly Twitter).
 </p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
 }

 if (loading) {
 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
 <div className="text-white text-xl">Loading...</div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
 {screen === 'auth' && (
 <div className="min-h-screen flex items-center justify-center p-4">
 <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 w-full max-w-md p-8 md:p-10 anim-fade-up">
 <div className="text-center mb-10">
 <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
 <Trophy className="w-12 h-12 rounded-3xl text-white" />
 </div>
 <h1 className="text-5xl font-light text-white mb-3">Postseason Fantasy</h1>
 <p className="text-white/50 text-lg">Build your championship roster</p>
 </div>

 <div className="space-y-5">
 <div>
 <label className="block text-sm font-bold text-white/80 mb-2">Email</label>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
 className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
 placeholder="you@example.com"
 />
 </div>

 <div>
 <label className="block text-sm font-bold text-white/80 mb-2">Password</label>
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && handleAuth(e)}
 className="w-full px-5 py-4 bg-white/5 backdrop-blur-sm border-2 border-white/10 rounded-3xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
 placeholder="••••••••"
 />
 </div>

 {error && (
 <div className="bg-red-500/10 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-3xl text-sm font-medium">
 {error}
 </div>
 )}

 <button
 onClick={handleAuth}
 className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition shadow-md hover:shadow-sm rounded-3xl"
 >
 {authMode === 'login' ? 'Log In' : 'Sign Up'}
 </button>
 </div>

 <div className="mt-8 text-center">
 <button
 onClick={() => {
 setAuthMode(authMode === 'login' ? 'signup' : 'login');
 setError('');
 }}
 className="text-orange-400 hover:text-orange-500 font-bold transition"
 >
 {authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
 </button>
 </div>
 </div>
 </div>
 )}

 {screen === 'league_selection' && (
 <div className="min-h-screen p-4 md:p-8">
 <div className="max-w-6xl mx-auto">
 {/* Header Card */}
 <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 mb-8 anim-fade-up">
 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
 <div>
 <h1 className="text-5xl font-light text-white mb-2">My Leagues</h1>
 <div className="flex items-center gap-2">
 <div className="w-2 h-2 rounded-full bg-green-500 rounded-full"></div>
 <p className="text-white/50 font-medium">{currentUser.email}</p>
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white/80 rounded-3xl hover:bg-white/10 transition font-semibold"
 >
 <LogOut className="w-5 h-5" />
 <span>Logout</span>
 </button>
 </div>

 {leagues.length > 0 && (
 <div className="mb-8">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-10 h-10 bg-orange-500/10 flex items-center justify-center">
 <Trophy className="w-6 h-6 rounded-3xl text-orange-400" />
 </div>
 <h2 className="text-2xl font-light text-white">Your Leagues</h2>
 </div>
 <div className="space-y-3">
 {leagues.map((league, index) => (
 <div
 key={league.id}
 className="w-full bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-md border border-white/10 p-5 rounded-3xl hover:from-white/10 hover:to-white/20 transition border border-white/10 hover:border-white/20 hover:shadow-md group"
 >
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0 rounded-2xl">
 {index + 1}
 </div>
 <div className="flex-1 min-w-0">
 <div className="font-semibold text-white text-lg mb-1 group-hover:text-orange-400 transition-colors truncate">
 {league.name}
 </div>
 <div className="flex items-center gap-2 text-sm text-white/50">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
 </svg>
 <span className="font-medium">{league.members.length} {league.members.length === 1 ? 'member' : 'members'}</span>
 </div>
 </div>
 <button
 onClick={() => selectLeague(league)}
 className="flex-shrink-0 px-6 py-2.5 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all hover:scale-105 shadow-lg"
 >
 Select
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="grid md:grid-cols-2 gap-6">
 {/* Create League Card */}
 <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-3xl anim-fade-up anim-delay-2 text-white shadow-md hover:shadow-md transition-al">
 <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center mb-6">
 <UserPlus className="w-8 h-8" />
 </div>
 <h2 className="text-2xl font-black mb-3">Create a League</h2>
 <p className="text-orange-100 mb-6">Start your own fantasy league and invite friends to compete</p>
 <input
 type="text"
 value={leagueName}
 onChange={(e) => setLeagueName(e.target.value)}
 placeholder="Enter league name..."
 className="w-full px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl text-white mb-4 font-medium placeholder:text-white/30 focus:ring-2 focus:ring-white"
 />
 <button
 onClick={handleCreateLeague}
 className="w-full bg-white text-orange-400 py-3 font-bold hover:bg-orange-500/10 backdrop-blur-sm transition shadow-sm rounded-3xl"
 >
 Create League
 </button>
 </div>

 {/* Join League Card */}
 <div className="bg-gradient-to-br from-blue-500/100 to-cyan-600 p-8 rounded-3xl text-white shadow-md hover:shadow-md transition-al">
 <div className="w-14 h-14 rounded-3xl bg-white/20 flex items-center justify-center mb-6">
 <Users className="w-8 h-8" />
 </div>
 <h2 className="text-2xl font-black mb-3">Join a League</h2>
 <p className="text-blue-100 mb-6">Enter an invite code to join an existing league</p>
 <input
 type="text"
 placeholder="Enter invite code..."
 className="w-full px-5 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-3xl text-white mb-4 font-medium placeholder:text-white/30 focus:ring-2 focus:ring-white"
 onKeyPress={(e) => {
 if (e.key === 'Enter' && e.target.value) {
 handleJoinLeague(e.target.value);
 }
 }}
 />
 <button
 onClick={(e) => {
 const input = e.target.previousElementSibling;
 if (input.value) handleJoinLeague(input.value);
 }}
 className="w-full bg-white text-blue-400 py-3 font-bold hover:bg-blue-500/10 backdrop-blur-sm transition shadow-sm rounded-3xl"
 >
 Join League
 </button>
 </div>
 </div>

 {error && (
 <div className="mt-6 bg-red-500/10 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-3xl text-sm font-medium">
 {error}
 </div>
 )}
 </div>
 </div>
 </div>
 )}

 {/* League Type Selection Modal */}
 {showLeagueTypeModal && (
 <div className="fixed inset-0 z-[100] overflow-y-auto">
 {/* Backdrop */}
 <div 
 className="fixed inset-0 bg-black/60 backdrop-blur-sm"
 onClick={() => setShowLeagueTypeModal(false)}
 />
 
 {/* Modal Content - centered with min-height for proper scrolling */}
 <div className="relative min-h-screen flex items-center justify-center p-4">
 <div className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl max-w-4xl w-full p-6 md:p-8 my-8">
 <h2 className="text-2xl md:text-4xl font-light text-white mb-2">Choose League Type</h2>
 <p className="text-white/50 mb-6">Select the format for your league</p>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 {/* Best Ball */}
 <div className="p-6 rounded-3xl border border-white/10 hover:border-orange-400 hover:bg-orange-500/10 transition">
 <div className="text-3xl mb-3">🏈</div>
 <h3 className="text-xl font-light text-white mb-2">Best Ball</h3>
 <p className="text-sm text-white/50 mb-3">
 Draft your team and let the best players automatically score each week. No roster management needed!
 </p>
 <div className="text-xs font-semibold text-orange-400 mb-4">Classic Mode</div>
 <button
 type="button"
 onClick={() => {
 createLeagueWithType(LEAGUE_TYPES.BEST_BALL);
 setShowLeagueTypeModal(false);
 }}
 className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 active:bg-orange-700 transition shadow-lg"
 >
 Select Best Ball
 </button>
 </div>

 {/* Salary Weekly */}
 <div className="p-6 rounded-3xl border border-green-500/30 hover:border-green-500 hover:bg-green-500/20 transition">
 <div className="text-3xl mb-3">💰</div>
 <h3 className="text-xl font-light text-white mb-2">Salary Weekly</h3>
 <p className="text-sm text-white/50 mb-3">
 $50,000 salary cap. Build a new team each week within budget. Strategic lineup changes!
 </p>
 <div className="text-xs font-semibold text-green-400 mb-4">Weekly Strategy</div>
 <button
 type="button"
 onClick={() => {
 createLeagueWithType(LEAGUE_TYPES.SALARY_WEEKLY);
 setShowLeagueTypeModal(false);
 }}
 className="w-full px-4 py-2.5 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 active:bg-green-700 transition shadow-lg"
 >
 Select Salary Weekly
 </button>
 </div>

 {/* Salary Postseason */}
 <div className="p-6 rounded-3xl border border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/20 transition">
 <div className="text-3xl mb-3">🏆</div>
 <h3 className="text-xl font-light text-white mb-2">Salary Postseason</h3>
 <p className="text-sm text-white/50 mb-3">
 $50,000 salary cap for the entire postseason. Draft once and compete through the playoffs!
 </p>
 <div className="text-xs font-semibold text-blue-400 mb-4">Championship Mode</div>
 <button
 type="button"
 onClick={() => {
 createLeagueWithType(LEAGUE_TYPES.SALARY_POSTSEASON);
 setShowLeagueTypeModal(false);
 }}
 className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 active:bg-blue-700 transition shadow-lg"
 >
 Select Salary Postseason
 </button>
 </div>
 </div>

 <button
 type="button"
 onClick={() => setShowLeagueTypeModal(false)}
 className="w-full px-4 py-3 bg-white/10 text-white/80 rounded-2xl hover:bg-white/20 transition font-medium"
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 )}

 {screen === 'team' && currentLeague && (
 <div className="min-h-screen">
 <div className="bg-white/5 backdrop-blur-xl border border-white/10">
 <div className="max-w-6xl mx-auto px-4 py-4">
 <div className="flex justify-between items-center">
 <div className="flex-1">
 <div className="flex items-center gap-3">
 {/* Profile Picture */}
 {teamName && (
 <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${PROFILE_PICTURES.find(p => p.id === profilePicture)?.bg || 'from-orange-500 to-orange-600'} flex items-center justify-center text-3xl shadow-md`}>
 {PROFILE_PICTURES.find(p => p.id === profilePicture)?.emoji || '🏈'}
 </div>
 )}
 <div>
 <h1 className="text-xl md:text-2xl font-light text-white">{currentLeague.name}</h1>
 {teamName && (
 <div className="mt-1">
 <p className="text-lg font-semibold text-orange-500">{teamName}</p>
 {teamMotto && (
 <p className="text-xs text-white/50 italic">"{teamMotto}"</p>
 )}
 </div>
 )}
 <p className="text-white/50 text-sm mt-1">Your Roster • {getTotalFantasyPoints()} Fantasy Points</p>
 </div>
 <button
 onClick={() => setShowSettingsModal(true)}
 className="p-2 hover:bg-white/5 rounded-2xl transition"
 title="Team Settings"
 >
 <Settings className="w-5 h-5 text-white/50" />
 </button>
 </div>
 </div>
 <button
 onClick={() => setScreen('league_selection')}
 className="px-4 py-2 bg-white/5 text-white/80 hover:bg-white/10 transition text-sm md:text-base rounded-2xl"
 >
 ← Back to Leagues
 </button>
 </div>

 {currentLeague.adminId === currentUser.id && (
 <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
 <div className="flex flex-col md:flex-row md:items-center gap-3">
 <div className="flex-1">
 <p className="text-sm font-medium text-white/80">Invite Code:</p>
 <p className="text-lg font-semibold text-orange-400">{currentLeague.inviteCode}</p>
 </div>
 <button
 onClick={copyInviteLink}
 className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-400 text-white hover:bg-orange-500/100 transition rounded-2xl"
 >
 {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
 {copied ? 'Copied!' : 'Copy Link'}
 </button>
 </div>
 </div>
 )}

 {/* Tab Navigation */}
 <div className="mt-6 border-b border-white/10">
 <div className="flex gap-4 overflow-x-auto">
 <button
 onClick={() => setActiveTab('dashboard')}
 className={`pb-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
 activeTab === 'dashboard'
 ? 'border-orange-400 text-orange-400'
 : 'border-transparent text-white/50 hover:text-white/80'
 }`}
 >
 Dashboard
 </button>
 <button
 onClick={() => setActiveTab('team')}
 className={`pb-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
 activeTab === 'team'
 ? 'border-orange-400 text-orange-400'
 : 'border-transparent text-white/50 hover:text-white/80'
 }`}
 >
 My Team
 </button>
 <button
 onClick={() => setActiveTab('gameweek')}
 className={`pb-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
 activeTab === 'gameweek'
 ? 'border-orange-400 text-orange-400'
 : 'border-transparent text-white/50 hover:text-white/80'
 }`}
 >
 Game Week
 </button>
 <button
 onClick={() => setActiveTab('schedule')}
 className={`pb-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
 activeTab === 'schedule'
 ? 'border-orange-400 text-orange-400'
 : 'border-transparent text-white/50 hover:text-white/80'
 }`}
 >
 Schedule
 </button>
 <button
 onClick={() => setActiveTab('news')}
 className={`pb-3 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition ${
 activeTab === 'news'
 ? 'border-orange-400 text-orange-400'
 : 'border-transparent text-white/50 hover:text-white/80'
 }`}
 >
 News
 </button>
 </div>
 </div>
 </div>
 </div>

 {/* Tab Content */}
 <div className="pb-24">
 {activeTab === 'dashboard' && <DashboardView />}
 {activeTab === 'team' && <TeamTab />}
 {activeTab === 'gameweek' && <GameWeekTab />}
 {activeTab === 'schedule' && <ScheduleTab />}
 {activeTab === 'news' && <NewsTab />}
 </div>
 </div>
 )}

 {/* Team Settings Modal */}
 {showSettingsModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className={`${GLASS_STYLES.modal} max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto`}>
 
 {/* Header */}
 <div className="flex justify-between items-center mb-8">
 <div>
 <h2 className="text-3xl font-light text-white">Team Settings</h2>
 <p className="text-white/50 text-sm mt-1">Customize your team identity</p>
 </div>
 <button
 onClick={() => setShowSettingsModal(false)}
 className={`${GLASS_STYLES.button} p-2 rounded-full hover:bg-white/20 transition`}
 >
 <X className="w-6 h-6 text-white/80" />
 </button>
 </div>

 {/* Live Preview Card */}
 <div className={`${GLASS_STYLES.card} p-6 mb-8`}>
 <p className="text-xs font-medium text-white/50 uppercase tracking-wide mb-4">Live Preview</p>
 <div className="flex items-center gap-4">
 <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${PROFILE_PICTURES.find(p => p.id === profilePicture)?.bg || 'from-orange-500 to-orange-600'} flex items-center justify-center text-5xl shadow-xl`}>
 {PROFILE_PICTURES.find(p => p.id === profilePicture)?.emoji || '🏈'}
 </div>
 <div className="flex-1">
 <h3 className="text-2xl font-semibold text-white">
 {teamName || 'Your Team Name'}
 </h3>
 {teamMotto && (
 <p className="text-sm text-white/60 italic mt-1">"{teamMotto}"</p>
 )}
 <div className="flex items-center gap-2 mt-2">
 <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full font-medium">
 {roster.length} players
 </span>
 <span className="text-xs px-2 py-1 bg-white/10 text-white/60 rounded-full">
 {getTotalFantasyPoints()} pts
 </span>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-6">
 {/* Team Name */}
 <div>
 <label className="block text-sm font-medium text-white/80 mb-2">Team Name</label>
 <input
 type="text"
 value={teamName}
 onChange={(e) => setTeamName(e.target.value)}
 placeholder="Enter your team name"
 className={`${GLASS_STYLES.input} w-full px-4 py-3`}
 maxLength={30}
 />
 <p className="text-xs text-white/50 mt-1">
 {teamName.length}/30 characters
 </p>
 </div>

 {/* Team Motto */}
 <div>
 <label className="block text-sm font-medium text-white/80 mb-2">Team Motto</label>
 <input
 type="text"
 value={teamMotto}
 onChange={(e) => setTeamMotto(e.target.value)}
 placeholder="Enter your team motto (optional)"
 className={`${GLASS_STYLES.input} w-full px-4 py-3`}
 maxLength={60}
 />
 <p className="text-xs text-white/50 mt-1">
 {teamMotto.length}/60 characters
 </p>
 </div>

 {/* Profile Picture Selection */}
 <div>
 <label className="block text-sm font-medium text-white/80 mb-3">Profile Picture</label>
 <div className="grid grid-cols-6 gap-3">
 {PROFILE_PICTURES.map((pic) => (
 <button
 key={pic.id}
 onClick={() => setProfilePicture(pic.id)}
 className={`relative aspect-square rounded-3xl bg-gradient-to-br ${pic.bg} flex items-center justify-center text-5xl transition-all transform hover:scale-110 hover:shadow-2xl ${
 profilePicture === pic.id ? 'ring-4 ring-orange-400 ring-offset-4 ring-offset-slate-900 scale-105' : 'opacity-70 hover:opacity-100'
 }`}
 title={pic.name}
 >
 {pic.emoji}
 {profilePicture === pic.id && (
 <div className="absolute -top-2 -right-2 w-7 h-7 bg-orange-400 rounded-full flex items-center justify-center shadow-lg">
 <Check className="w-4 h-4 text-white" strokeWidth={3} />
 </div>
 )}
 </button>
 ))}
 </div>
 <p className="text-xs text-white/50 mt-3 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-orange-400"></span>
 Selected: <span className="font-medium text-white/70">{PROFILE_PICTURES.find(p => p.id === profilePicture)?.name}</span>
 </p>
 </div>

 {/* Achievement Badges */}
 <div className={`${GLASS_STYLES.card} p-6`}>
 <div className="flex items-center gap-2 mb-4">
 <Award className="w-5 h-5 text-orange-400" />
 <h3 className="text-lg font-medium text-white">Achievement Badges</h3>
 </div>
 <div className="grid grid-cols-3 gap-2">
 <div className={`${GLASS_STYLES.card} p-4 text-center`}>
 <div className="text-3xl mb-2">🏆</div>
 <div className="text-xs font-medium text-white/70">League Member</div>
 <div className="text-xs text-white/40 mt-1">Joined a league</div>
 </div>
 <div className={`${GLASS_STYLES.card} p-4 text-center opacity-40`}>
 <div className="text-3xl mb-2">⭐</div>
 <div className="text-xs font-medium text-white/50">First Win</div>
 <div className="text-xs text-white/30 mt-1">Win your first week</div>
 </div>
 <div className={`${GLASS_STYLES.card} p-4 text-center opacity-40`}>
 <div className="text-3xl mb-2">🔥</div>
 <div className="text-xs font-medium text-white/50">Hot Streak</div>
 <div className="text-xs text-white/30 mt-1">3 wins in a row</div>
 </div>
 </div>
 </div>

 {error && (
 <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
 <Info className="w-4 h-4 flex-shrink-0" />
 {error}
 </div>
 )}

 <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
 <button
 onClick={saveTeamName}
 className={`${GLASS_STYLES.buttonPrimary} flex-1 py-3 rounded-2xl font-semibold text-white shadow-lg hover:shadow-xl transition-all`}
 >
 Save Changes
 </button>
 <button
 onClick={() => setShowSettingsModal(false)}
 className={`${GLASS_STYLES.button} px-6 py-3 rounded-2xl font-semibold text-white/80 hover:text-white transition-all`}
 >
 Cancel
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {showPlayerModal && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
 <div className="min-h-screen flex items-start justify-center p-4 py-8">
 <div className={`${GLASS_STYLES.modal} w-full max-w-5xl flex flex-col max-h-[90vh]`}>
 
 <div className="p-6 border-b border-white/10 flex-shrink-0">
 <div className="flex justify-between items-start mb-4">
 <div className="flex-1">
 <h2 className="text-3xl font-light text-white">Available Players</h2>
 <p className="text-white/50 text-sm mt-1">2024 NFL Season • {filteredPlayers.length} players</p>
 {currentLeague?.leagueType !== LEAGUE_TYPES.BEST_BALL && (
 <div className="mt-3 flex items-center gap-2">
 <span className="text-sm font-semibold text-white/70">Remaining Budget:</span>
 <span className={`text-xl font-bold ${remainingBudget < 5000 ? 'text-red-400' : 'text-green-400'}`}>
 ${remainingBudget.toLocaleString()}
 </span>
 </div>
 )}
 </div>
 <button
 onClick={() => {
 setShowPlayerModal(false);
 setSelectedPlayer(null);
 setError('');
 }}
 className={`${GLASS_STYLES.button} p-2 rounded-full hover:bg-white/20 transition flex-shrink-0`}
 >
 <X className="w-6 h-6 text-white/80" />
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
 <div className="relative md:col-span-1">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
 <input
 type="text"
 placeholder="Search players..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className={`${GLASS_STYLES.input} w-full pl-10 pr-4 py-3`}
 />
 </div>

 <div className="relative">
 <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
 <select
 value={filterPosition}
 onChange={(e) => setFilterPosition(e.target.value)}
 className={`${GLASS_STYLES.input} w-full pl-10 pr-4 py-3 cursor-pointer appearance-none`}
 >
 <option value="ALL">All Positions</option>
 <option value="QB">Quarterbacks</option>
 <option value="RB">Running Backs</option>
 <option value="WR">Wide Receivers</option>
 <option value="TE">Tight Ends</option>
 <option value="K">Kickers</option>
 <option value="DEF">Defenses</option>
 </select>
 </div>

 <div className="relative">
 <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 pointer-events-none" />
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className={`${GLASS_STYLES.input} w-full pl-10 pr-4 py-3 cursor-pointer appearance-none`}
 >
 <option value="points">Sort: Highest Points</option>
 <option value="recent">Sort: Best Average</option>
 <option value="name">Sort: Name (A-Z)</option>
 </select>
 </div>
 </div>
 </div>

 <div className="overflow-y-auto flex-1 p-6" style={{overflowY: 'scroll', WebkitOverflowScrolling: 'touch'}}>
 {loadingPlayers ? (
 <div className="flex flex-col items-center justify-center py-16">
 <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-orange-400 mb-4"></div>
 <p className="text-white/60 text-lg">Loading players...</p>
 </div>
 ) : (
 <div className="space-y-3">
 {filteredPlayers.length === 0 ? (
 <div className="text-center py-16 text-white/50">
 <Users className="w-16 h-16 mx-auto mb-4 text-white/20" />
 <p className="text-lg">No players found</p>
 <p className="text-sm mt-2">Try adjusting your filters</p>
 </div>
 ) : (
 filteredPlayers.map(player => {
 const isOnRoster = roster.some(p => p.id === player.id);
 const positionCount = roster.filter(p => p.position === player.position).length;
 const isFull = positionCount >= ROSTER_STRUCTURE[player.position];
 const isHot = (player.fantasyPointsPerGame || 0) > 15;

 return (
 <div
 key={player.id}
 className={`bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-4 cursor-pointer transition-all hover:bg-white/10 ${
 isOnRoster ? 'opacity-50 cursor-not-allowed' : ''
 }`}
 onClick={() => openPlayerProfile(player)}
 >
 <div className="flex items-start justify-between mb-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-2">
 <h3 className="font-semibold text-white text-base">{player.name}</h3>
 {isHot && <span className="text-sm">🔥</span>}
 {isOnRoster && (
 <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">
 On Roster
 </span>
 )}
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-xs px-3 py-1.5 ${GLASS_STYLES.badge} font-semibold`}>
 {player.position}
 </span>
 <span className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full font-medium">
 {player.team}
 </span>
 <span className="text-xs text-white/50">
 {player.gamesPlayed} games
 </span>
 </div>
 </div>

 <button
 onClick={(e) => {
 e.stopPropagation();
 addPlayerToRoster(player);
 }}
 disabled={isOnRoster || isFull}
 className={`flex-shrink-0 ml-3 p-3 rounded-xl transition-all ${
 isOnRoster || isFull
 ? 'bg-white/5 text-white/30 cursor-not-allowed'
 : 'bg-orange-500/90 text-white hover:bg-orange-500 hover:scale-110 shadow-lg'
 }`}
 title={isOnRoster ? 'Already on roster' : isFull ? 'Position full' : 'Add to roster'}
 >
 {isOnRoster ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
 </button>
 </div>

 <div className="grid grid-cols-3 gap-3 text-sm">
 <div className="text-center">
 <div className="text-xs text-white/40 mb-0.5">Total</div>
 <div className="text-lg font-bold text-orange-400">{player.fantasyPoints}</div>
 </div>
 <div className="text-center">
 <div className="text-xs text-white/40 mb-0.5">Avg</div>
 <div className="text-lg font-bold text-white">{player.fantasyPointsPerGame}</div>
 </div>
 {currentLeague?.leagueType !== LEAGUE_TYPES.BEST_BALL ? (
 <div className="text-center">
 <div className="text-xs text-white/40 mb-0.5">Salary</div>
 <div className="text-lg font-bold text-green-400">${(player.salary / 1000).toFixed(0)}K</div>
 </div>
 ) : (
 <div className="text-center">
 <div className="text-xs text-white/40 mb-0.5">Rank</div>
 <div className="text-lg font-bold text-white">#{filteredPlayers.indexOf(player) + 1}</div>
 </div>
 )}
 </div>

 {selectedPlayer?.id === player.id && (
 <div className="mt-4 pt-4 border-t border-white/10">
 <button
 className="w-full text-xs text-orange-400 hover:text-orange-300 font-medium"
 onClick={(e) => {
 e.stopPropagation();
 setSelectedPlayer(null);
 }}
 >
 Hide details
 </button>
 </div>
 )}

 {!selectedPlayer && (
 <button
 onClick={(e) => {
 e.stopPropagation();
 setSelectedPlayer(player);
 }}
 className="w-full mt-3 text-xs text-white/50 hover:text-orange-400 font-medium transition"
 >
 View details →
 </button>
 )}
 </div>
 );
 })
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Bottom Navigation - Floating Glassmorphic */}
 {screen === 'team' && currentLeague && (
 <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-40 pointer-events-none">
 <div className="max-w-lg mx-auto bg-slate-900/70 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl pointer-events-auto" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(249,115,22,0.06)' }}>
 <div className="flex items-center justify-around px-3 py-2.5">
 {/* Dashboard */}
 <button
 onClick={() => setActiveTab('dashboard')}
 className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
 activeTab === 'dashboard'
 ? 'bg-orange-500/20 text-orange-400'
 : 'text-white/50 hover:text-white/90 hover:bg-white/5'
 }`}
 style={activeTab === 'dashboard' ? { boxShadow: '0 0 12px rgba(249,115,22,0.15)' } : {}}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
 </svg>
 <span className="text-[10px] font-medium tracking-wide">Home</span>
 </button>

 {/* My Team */}
 <button
 onClick={() => setActiveTab('team')}
 className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
 activeTab === 'team'
 ? 'bg-orange-500/20 text-orange-400'
 : 'text-white/50 hover:text-white/90 hover:bg-white/5'
 }`}
 style={activeTab === 'team' ? { boxShadow: '0 0 12px rgba(249,115,22,0.15)' } : {}}
 >
 <Users className="w-5 h-5" />
 <span className="text-[10px] font-medium tracking-wide">Team</span>
 </button>

 {/* Gameday */}
 <button
 onClick={() => setActiveTab('gameweek')}
 className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
 activeTab === 'gameweek'
 ? 'bg-orange-500/20 text-orange-400'
 : 'text-white/50 hover:text-white/90 hover:bg-white/5'
 }`}
 style={activeTab === 'gameweek' ? { boxShadow: '0 0 12px rgba(249,115,22,0.15)' } : {}}
 >
 <Trophy className="w-5 h-5" />
 <span className="text-[10px] font-medium tracking-wide">Gameday</span>
 </button>

 {/* Schedule */}
 <button
 onClick={() => setActiveTab('schedule')}
 className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
 activeTab === 'schedule'
 ? 'bg-orange-500/20 text-orange-400'
 : 'text-white/50 hover:text-white/90 hover:bg-white/5'
 }`}
 style={activeTab === 'schedule' ? { boxShadow: '0 0 12px rgba(249,115,22,0.15)' } : {}}
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 <span className="text-[10px] font-medium tracking-wide">Schedule</span>
 </button>

 {/* League */}
 <button
 onClick={() => setScreen('league_selection')}
 className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-white/50 hover:text-white/90 hover:bg-white/5 transition-all duration-200"
 >
 <Settings className="w-5 h-5" />
 <span className="text-[10px] font-medium tracking-wide">League</span>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ═══ Player Profile Modal ═══ */}
 <PlayerProfileModal />

 </div>
 );
}

export default App;