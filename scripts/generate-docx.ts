import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

async function generateDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22, // 11pt
            color: '1E293B',
          },
          paragraph: {
            spacing: {
              after: 140,
              line: 280,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '⚡ Game Hub: 60-Second Reaction Blitz',
                bold: true,
                size: 40,
                color: '0891B2',
              }),
            ],
          }),

          // Subtitle
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'High-Performance Arcade Reflex Challenge & Real-Time Multiplayer Room Scoreboards',
                italics: true,
                size: 24,
                color: '64748B',
              }),
            ],
          }),

          // Divider Line
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: '_________________________________________________________________________________',
                color: 'CBD5E1',
              }),
            ],
          }),

          // Overview Section
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: '1. Overview & Architecture',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Game Hub: 60-Second Reaction Blitz is an intense, fast-paced 60-second reflex challenge and arcade game built with ',
              }),
              new TextRun({ text: 'React 18', bold: true }),
              new TextRun({ text: ', ' }),
              new TextRun({ text: 'TypeScript', bold: true }),
              new TextRun({ text: ', ' }),
              new TextRun({ text: 'Tailwind CSS', bold: true }),
              new TextRun({ text: ', and an ' }),
              new TextRun({ text: 'Express.js backend server', bold: true }),
              new TextRun({
                text: '. The application allows players to test their hand-eye coordination, build high-combo streaks, unlock tactical powerups, and challenge their rivals across devices in synchronized multiplayer rooms with real-time score ranking.',
              }),
            ],
          }),

          // Gameplay Features
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: '2. Core Gameplay & Node Types',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'During each 60-second match, energy targets spawn across the arena. Tapping nodes scores points, builds combo multipliers, and spawns particle animations:',
              }),
            ],
          }),

          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '⚡ Standard Energy Nodes (+100 pts): ', bold: true, color: '0284C7' }),
              new TextRun({ text: 'The core reflex targets that build your combo chain.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '👑 Golden Bonus Targets (+250 pts): ', bold: true, color: 'D97706' }),
              new TextRun({ text: 'Rare, high-value nodes awarding significant points.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '⏰ Time Boosters (+3s Time Bonus): ', bold: true, color: '059669' }),
              new TextRun({ text: 'Extends your 60-second timer to allow higher cumulative scores.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '🚀 Multiplier Surge (2x Boost for 8s): ', bold: true, color: '9333EA' }),
              new TextRun({ text: 'Doubles all incoming points from hits and streaks for 8 seconds.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: '💣 Hazard Traps (-150 pts penalty): ', bold: true, color: 'E11D48' }),
              new TextRun({ text: 'Triggers screen shake, penalizes points, and resets your combo streak to zero.' }),
            ],
          }),

          // Difficulty Modes Table
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 140 },
            children: [
              new TextRun({
                text: '3. Difficulty Modes & Multipliers',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Difficulty Mode', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Spawn Rate', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Score Multiplier', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: '0F172A' },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: 'Hazards & Mechanics', bold: true, color: 'FFFFFF' })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Casual', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '1200ms' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '1.0x' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'No traps or hazards' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Focused', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '900ms' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '1.5x' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Faster tempo, standard nodes' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Turbo Reflex', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '700ms' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '2.0x' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Hazard bombs + moving targets' })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cyber Overdrive', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '500ms' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '3.0x' })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Teleporting nodes + decoy traps' })] })],
                  }),
                ],
              }),
            ],
          }),

          // Multiplayer Scoreboard
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: '4. Multiplayer Rooms & Live Leaderboard',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Custom Room Codes: ', bold: true }),
              new TextRun({ text: 'Create private or shared rooms (e.g., BLITZ-789) with direct URL share links.' }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Head-to-Head 2-Player Matchups: ', bold: true }),
              new TextRun({
                text: 'When two rivals play in a room, the scoreboard automatically renders a live Head-to-Head comparison showing who is leading and the points gap.',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Unique Player Best Record: ', bold: true }),
              new TextRun({
                text: 'Deduplicates multiple game rounds so each real player appears once with their peak high score and round count.',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Cross-Device Server Synchronization: ', bold: true }),
              new TextRun({
                text: 'Central REST endpoint (/api/scores) and background polling synchronize points instantly across phones and laptops.',
              }),
            ],
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'CSV Export: ', bold: true }),
              new TextRun({ text: 'One-click export of room or global score tables into CSV spreadsheets.' }),
            ],
          }),

          // Audio Synthesizer
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: '5. Procedural Web Audio Engine',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The game features a zero-dependency procedural audio engine using the native HTML5 Web Audio API (AudioContext). It dynamically generates custom sine, triangle, and sawtooth waves for hits, streak pitch ascensions, golden chimes, countdown beeps, and victory fanfares.',
              }),
            ],
          }),

          // Installation & Commands
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 280, after: 120 },
            children: [
              new TextRun({
                text: '6. Installation & Execution Commands',
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Install packages: ', bold: true }),
              new TextRun({ text: 'npm install', font: 'Consolas', color: '0891B2' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Start local server: ', bold: true }),
              new TextRun({ text: 'npm run dev', font: 'Consolas', color: '0891B2' }),
              new TextRun({ text: ' (Runs at http://localhost:3000)' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Production build: ', bold: true }),
              new TextRun({ text: 'npm run build && npm run start', font: 'Consolas', color: '0891B2' }),
            ],
          }),

          // Summary Footer
          new Paragraph({
            spacing: { before: 300, after: 100 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Generated for Game Hub — 60-Second Reaction Blitz',
                italics: true,
                size: 18,
                color: '94A3B8',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(process.cwd(), 'README.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated README.docx at ${outPath}`);

  // Also write to public folder so it can be downloaded directly from browser
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(path.join(publicDir, 'README.docx'), buffer);
  console.log(`Also saved to /public/README.docx for direct client download.`);
}

generateDocx().catch((err) => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
