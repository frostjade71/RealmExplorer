import type { ServerCategory, ServerType } from '../types'

export type ServerPlatform = 'bedrock' | 'java'

export interface LandingPage {
  slug: string
  label: string
  title: string
  heading: string
  description: string
  intro: string
  type?: ServerType
  category?: ServerCategory
  platform?: ServerPlatform
  sections: { heading: string; text: string }[]
}

const votingSection = {
  heading: 'How listings and votes work',
  text: 'Owners add their own listing and our staff review it before it goes live. You can vote for a listing once a day and leave a rating, which helps good communities get noticed.',
}

export const landingPages: LandingPage[] = [
  {
    slug: 'minecraft-bedrock-realms',
    label: 'Bedrock Realms',
    title: 'Minecraft Bedrock Realms: Active Realm Codes',
    heading: 'Minecraft Bedrock Realms',
    description:
      'Browse active Minecraft Bedrock realms with realm codes you can join today. Find SMP, factions, skyblock and modded realms picked by the community.',
    intro: 'Find active Minecraft Bedrock realms and join with a realm code. Every realm is listed by its owner and voted on by the community.',
    type: 'realm',
    sections: [
      {
        heading: 'What is a Minecraft Bedrock realm?',
        text: 'A realm is a private, always online Minecraft world hosted by Mojang. Bedrock realms work on Xbox, PlayStation, Nintendo Switch, mobile and Windows, so friends on different devices can play in the same world. The owner shares a realm code, and anyone with the code can join.',
      },
      {
        heading: 'How do I join a realm with a code?',
        text: 'Open Minecraft, press Play and find the Join Realm button. Enter the realm code from the listing and the realm is added to your realms list. You do not need your own Realms subscription to join someone else\'s realm.',
      },
      {
        heading: 'How are realms listed here?',
        text: 'Realm owners add their realm to Realm Explorer and our staff review each listing before it goes live. Players can vote once a day and leave a rating, which helps good realms get noticed.',
      },
    ],
  },
  {
    slug: 'minecraft-bedrock-servers',
    label: 'Bedrock Servers',
    title: 'Minecraft Bedrock Servers List: IPs and Ports',
    heading: 'Minecraft Bedrock Servers',
    description:
      'Find Minecraft Bedrock servers with IP addresses and ports for Xbox, PlayStation, Switch, mobile and PC. Browse SMP, factions, skyblock, prison and more.',
    intro: 'Minecraft Bedrock servers you can join from console, mobile and PC. Copy the server address and port from a listing and start playing.',
    type: 'server',
    platform: 'bedrock',
    sections: [
      {
        heading: 'How do I join a Bedrock server?',
        text: 'Open Minecraft, press Play and go to the Servers tab. Choose Add Server, then enter the server address and port from the listing. The default Bedrock port is 19132. Console players may need to follow the steps the server gives on its listing or Discord.',
      },
      {
        heading: 'Bedrock servers and Java servers',
        text: 'Bedrock Edition and Java Edition are separate versions of Minecraft and cannot join each other\'s servers, unless the server runs software that accepts both. Every server on this page has a Bedrock address.',
      },
      {
        heading: 'Vote for your favorite server',
        text: 'You can vote for a server once a day. Votes help a server get noticed, and many servers reward voters in game.',
      },
    ],
  },
  {
    slug: 'minecraft-java-servers',
    label: 'Java Servers',
    title: 'Minecraft Java Servers List',
    heading: 'Minecraft Java Servers',
    description:
      'Browse Minecraft Java Edition servers with IP addresses. Find SMP, factions, skyblock, prison and minigame servers and vote for your favorites.',
    intro: 'Minecraft Java Edition servers listed by their owners. Copy the server IP from a listing and add it in Multiplayer.',
    type: 'server',
    platform: 'java',
    sections: [
      {
        heading: 'How do I join a Java server?',
        text: 'Open Minecraft Java Edition, choose Multiplayer and select Add Server. Paste the server address from the listing and join.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-server-list',
    label: 'Server List',
    title: 'Minecraft Server List: Bedrock and Java Servers',
    heading: 'Minecraft Server List',
    description:
      'A Minecraft server list for Bedrock and Java players. Browse servers by category, see which ones are online and vote for the servers you enjoy.',
    intro: 'Every Minecraft server on Realm Explorer in one list, for Bedrock and Java players. Filter by category to find the kind of server you want.',
    type: 'server',
    sections: [
      {
        heading: 'Finding the right server',
        text: 'Use the category filters to narrow the list to SMP, factions, skyblock, prison, PvP and more. Open a listing to see its address, description, screenshots and Discord.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-smp-servers',
    label: 'SMP Servers',
    title: 'Minecraft SMP Servers and Realms',
    heading: 'Minecraft SMP Servers & Realms',
    description:
      'Find Minecraft SMP servers and realms to join. Browse survival multiplayer communities for Bedrock and Java and vote for your favorites.',
    intro: 'Survival multiplayer servers and realms where you build, trade and team up with other players.',
    category: 'smp',
    sections: [
      {
        heading: 'What is an SMP?',
        text: 'SMP stands for survival multiplayer. Players share one survival world, build bases, trade and team up, often with extras like land claims or an economy.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-factions-servers',
    label: 'Factions Servers',
    title: 'Minecraft Factions Servers and Realms',
    heading: 'Minecraft Factions Servers & Realms',
    description:
      'Browse Minecraft factions servers and realms. Join a faction, claim land, build a base and raid your rivals on Bedrock and Java.',
    intro: 'Factions servers and realms where you claim land, build a base and fight rival factions.',
    category: 'factions',
    sections: [
      {
        heading: 'What is a factions server?',
        text: 'Players form factions, claim land, build bases and raid rival factions for loot and power. Teamwork and a well defended base matter as much as combat.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-skyblock-servers',
    label: 'Skyblock Servers',
    title: 'Minecraft Skyblock Servers and Realms',
    heading: 'Minecraft Skyblock Servers & Realms',
    description:
      'Find Minecraft skyblock servers and realms. Start on a floating island, expand it and trade with other players on Bedrock and Java.',
    intro: 'Skyblock servers and realms where you start on a small floating island and build it into something bigger.',
    category: 'skyblock',
    sections: [
      {
        heading: 'What is skyblock?',
        text: 'You start on a small island in the sky with very few resources. You grow the island over time, complete challenges and trade with other players.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-prison-servers',
    label: 'Prison Servers',
    title: 'Minecraft Prison Servers and Realms',
    heading: 'Minecraft Prison Servers & Realms',
    description:
      'Browse Minecraft prison servers and realms. Mine, earn money and rank up until you are free, on Bedrock and Java.',
    intro: 'Prison servers and realms where you mine, earn money and rank up.',
    category: 'prison',
    sections: [
      {
        heading: 'What is a prison server?',
        text: 'You start at the lowest rank, mine to earn money and pay to rank up. Each rank opens better mines, and the goal is to work your way to freedom.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-pvp-servers',
    label: 'PvP Servers',
    title: 'Minecraft PvP Servers and Realms',
    heading: 'Minecraft PvP Servers & Realms',
    description:
      'Find Minecraft PvP and KitPvP servers and realms. Pick a kit, jump into fights and climb the leaderboards on Bedrock and Java.',
    intro: 'KitPvP servers and realms where you pick a kit and go straight into a fight.',
    category: 'kitpvp',
    sections: [
      {
        heading: 'What is KitPvP?',
        text: 'KitPvP gives every player a set of gear, called a kit, so fights start right away. You earn rewards for kills and unlock stronger kits as you play.',
      },
      votingSection,
    ],
  },
  {
    slug: 'minecraft-minigame-servers',
    label: 'Minigame Servers',
    title: 'Minecraft Minigame Servers and Realms',
    heading: 'Minecraft Minigame Servers & Realms',
    description:
      'Browse Minecraft minigame servers and realms. Play quick competitive games with friends on Bedrock and Java.',
    intro: 'Minigame servers and realms with quick games you can play with friends.',
    category: 'minigames',
    sections: [
      {
        heading: 'What is a minigame server?',
        text: 'Minigame servers host short games inside Minecraft, such as races, arena battles and parkour. Rounds are quick, so they are easy to join with friends.',
      },
      votingSection,
    ],
  },
]

export function categoryPath(category: ServerCategory) {
  const page = landingPages.find(p => p.category === category && !p.type && !p.platform)
  return page ? `/${page.slug}` : `/servers?category=${category}`
}

export function filterLanding(type: ServerType | null, category: ServerCategory | null) {
  return landingPages.find(p => !p.platform && (p.type ?? null) === type && (p.category ?? null) === category)
}
