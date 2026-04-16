// Compute a compatibility score between a user profile and an opportunity
export function computeScore(profile, opportunity) {
  if (!profile || !opportunity) return { score: 0, reasons: [], risk: null };

  let score = 0;
  const reasons = [];
  let risk = null;

  // Skill match (up to 35 points)
  const userSkills = [...(profile.technical_skills || []), ...(profile.soft_skills || [])].map(s => s.toLowerCase());
  const neededSkills = (opportunity.skills_needed || []).map(s => s.toLowerCase());
  if (neededSkills.length > 0) {
    const matched = neededSkills.filter(s => userSkills.some(us => us.includes(s) || s.includes(us)));
    const skillScore = Math.round((matched.length / neededSkills.length) * 35);
    score += skillScore;
    if (matched.length > 0) reasons.push(`You have ${matched.length} of ${neededSkills.length} required skills`);
    if (matched.length < neededSkills.length) risk = `Missing ${neededSkills.length - matched.length} skill(s): ${neededSkills.filter(s => !matched.includes(s)).slice(0, 2).join(", ")}`;
  } else {
    score += 20; // no specific skills needed
  }

  // Goal alignment (up to 25 points)
  const goals = (profile.goals || []);
  if (goals.includes(opportunity.type)) {
    score += 25;
    reasons.push(`Matches your ${opportunity.type.replace("_", " ")} goal`);
  } else {
    score += 5;
  }

  // Level alignment (up to 15 points)
  const levelMap = { high_school: 0, bachelor_1: 1, bachelor_2: 2, bachelor_3: 3, master_1: 4, master_2: 5, phd: 6 };
  const userLevel = levelMap[profile.academic_level] ?? 3;
  const oppLevel = opportunity.level;
  if (oppLevel === "any" || !oppLevel) {
    score += 15;
  } else if (oppLevel === "bachelor" && userLevel >= 1 && userLevel <= 3) {
    score += 15;
    reasons.push("Your academic level matches");
  } else if (oppLevel === "master" && userLevel >= 4 && userLevel <= 5) {
    score += 15;
    reasons.push("Your academic level matches");
  } else if (oppLevel === "phd" && userLevel === 6) {
    score += 15;
  } else {
    score += 5;
    if (!risk) risk = "Academic level may not fully match";
  }

  // Domain match (up to 15 points)
  const domains = (opportunity.domains || []).map(d => d.toLowerCase());
  const field = (profile.field_of_study || "").toLowerCase();
  const fieldWords = field.split(/[\s,&\/]+/).filter(w => w.length > 2);
  const domainMatch = domains.length === 0 || domains.some(d =>
    fieldWords.some(w => d.includes(w) || w.includes(d.split(" ")[0]))
  );
  if (domainMatch) {
    score += 15;
    if (domains.length > 0) reasons.push("Your field of study is relevant");
  } else {
    score += 3;
  }

  // Country (up to 10 points)
  const userCountry = (profile.country || "").toLowerCase();
  const oppCountry = (opportunity.country || "").toLowerCase();
  if (opportunity.is_remote || oppCountry === "remote" || oppCountry === "global" || !oppCountry) {
    score += 10;
  } else if (userCountry && oppCountry.includes(userCountry.toLowerCase())) {
    score += 10;
    reasons.push("Available in your country");
  } else {
    score += 2;
    if (!risk) risk = "This opportunity may not be available in your country";
  }

  // Deadline urgency bonus
  if (opportunity.deadline) {
    const daysLeft = Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 14) {
      reasons.push("Deadline is approaching — act soon");
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons: reasons.slice(0, 3),
    risk,
  };
}

export function generateExplanation(profile, opportunity, matchData) {
  const { score, reasons } = matchData;
  const skillList = [...(profile.technical_skills || [])].slice(0, 3).join(", ");
  const level = (profile.academic_level || "").replace(/_/g, " ");

  if (score >= 80) {
    return `Strong match — your ${skillList} skills and ${level} level align well with this ${opportunity.type.replace("_", " ")}.`;
  } else if (score >= 60) {
    return `Good fit — you meet most requirements. ${reasons[0] || ""}`;
  } else if (score >= 40) {
    return `Partial match — some skills align but there may be gaps. Worth exploring.`;
  }
  return `This opportunity has some relevance to your profile, but may require additional qualifications.`;
}