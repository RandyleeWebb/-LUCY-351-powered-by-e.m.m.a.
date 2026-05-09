fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'LucyAI'
description 'Standalone Lucy AI role/mission framework for FiveM. No QBCore dependency.'
version '1.0.0'

shared_scripts {
  'shared/config.lua',
  'shared/gangs.lua'
}

server_scripts {
  'server/state.lua',
  'server/director.lua',
  'server/bridge.lua',
  'server/main.lua'
}

client_scripts {
  'client/main.lua',
  'client/menu.lua',
  'client/missions.lua',
  'client/npc_spawner.lua'
}
