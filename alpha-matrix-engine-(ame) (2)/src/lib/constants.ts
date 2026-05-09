import { Entity, Layer, Asset } from '../types';

export const INITIAL_ENTITIES: Entity[] = [
  {
    id: '1',
    name: 'Skybox_Atmosphere',
    type: 'Volume',
    visible: true,
    locked: true,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: '2',
    name: 'Main_Directional_Light',
    type: 'Light',
    visible: true,
    locked: false,
    position: [10, 20, 10],
    rotation: [-45, 45, 0],
    scale: [1, 1, 1],
  },
  {
    id: '3',
    name: 'Hero_Building_LOD0',
    type: 'Mesh',
    visible: true,
    locked: false,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  {
    id: '4',
    name: 'Ground_Plane_8K',
    type: 'Mesh',
    visible: true,
    locked: true,
    position: [0, -0.5, 0],
    rotation: [0, 0, 0],
    scale: [100, 1, 100],
  },
];

export const INITIAL_LAYERS: Layer[] = [
  { id: 'l1', name: 'Geometry Layer', active: true, type: 'Geometry' },
  { id: 'l2', name: 'Texture Layer (8K)', active: true, type: 'Texture' },
  { id: 'l3', name: 'Global Illumination', active: true, type: 'Lighting' },
  { id: 'l4', name: 'Jolt Physics', active: false, type: 'Physics' },
  { id: 'l5', name: 'AI Navigation', active: false, type: 'AI' },
];

export const INITIAL_ASSETS: Asset[] = [
  { id: 'a1', name: 'T_Rock_Base_8K.exr', type: 'Texture', size: '128 MB', path: '/textures/rock' },
  { id: 'a2', name: 'M_Hero_Statue.fbx', type: 'Model', size: '45 MB', path: '/models/hero' },
  { id: 'a3', name: 'S_PlayerController.lua', type: 'Script', size: '12 KB', path: '/scripts/player' },
  { id: 'a4', name: 'A_Wind_Ambience.wav', type: 'Audio', size: '4.2 MB', path: '/audio/ambient' },
];

export const LUCY_LINKABLE_APPS = [
  {
    name: 'Unity',
    url: 'https://unity.com',
    strengths: 'Versatile for 2D/3D, mobile, indie, cross-platform. C# scripting.',
    aiTools: 'Official Unity AI (Assistant, AI Gateway, MCP Server) for in-editor agentic assistant. Coplay for collaborative AI tasks. Asset Store AI (Promethean AI, Convai). Third-party RAG/context plugins, Cursor/Claude Code support.'
  },
  {
    name: 'Unreal Engine (UE5+)',
    url: 'https://www.unrealengine.com',
    strengths: 'AAA visuals, high-fidelity 3D, Blueprints + C++.',
    aiTools: 'Built-in AI Assistant Plugin (5.7+). NeoStack AI / Neo AI for Blueprints, behavior trees. Ludus AI for C++ assistance. TotalAI, oakisnotree for generative AI integration. Convai Unreal Plugin. Epic Fab for AI assets.'
  },
  {
    name: 'Godot (4.x+)',
    url: 'https://godotengine.org',
    strengths: 'Free/open-source, lightweight, excellent for 2D/3D indie, GDScript + C#.',
    aiTools: 'Godot AI (MCP-compatible) builds scenes, scripts, UI in editor. AI Assistant Hub, Fuku, Ziva for editor chat, code gen, level drawing. Godot Copilot (OpenAI/Gemini). Cursor/Claude Code with strong Godot support via MCP.'
  },
  {
    name: 'GameMaker',
    url: 'https://gamemaker.io',
    strengths: 'Beginner-friendly 2D, drag-and-drop + GML scripting.',
    aiTools: 'Marketplace extensions for runtime AI. GMS2-AI Assistant (external tool). External IDEs (VS Code/Cursor) with GML support or Claude projects are recommended.'
  },
  {
    name: 'Construct 3',
    url: 'https://www.construct.net',
    strengths: 'No-code/HTML5-focused.',
    aiTools: 'AI via external assistants or project-aware chats; limited direct plugins.'
  },
  {
    name: 'Cocos Creator',
    url: 'https://www.cocos.com',
    strengths: 'Good for 2D/mobile. JavaScript/TypeScript.',
    aiTools: 'MCP servers and AI assistants similar to Unity/Godot.'
  },
  {
    name: 'Defold',
    url: 'https://defold.com',
    strengths: 'Lightweight, Lua-based.',
    aiTools: 'Use external AI IDEs (Cursor, Claude Code) on project files; no major dedicated editor plugins.'
  },
  {
    name: 'CryEngine',
    url: 'https://www.cryengine.com',
    strengths: 'High-fidelity graphics, C++.',
    aiTools: 'Use general coding AIs. Limited public AI plugin info.'
  }
];

