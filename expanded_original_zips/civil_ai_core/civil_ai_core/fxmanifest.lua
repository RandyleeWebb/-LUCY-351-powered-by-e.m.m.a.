fx_version 'cerulean'
game 'gta5'
lua54 'yes'

author 'Civil Unrest Framework'
description 'AI Core: Handles Police, EMS, and Civilian dispatch with dynamic reinforcements'
version '2.0.0'

shared_scripts {
    '@qb-core/shared/locale.lua',
    'config.lua',
}

client_scripts {
    'client/police_ai.lua',
    'client/ems_ai.lua',
    'client/civilian_dispatcher.lua',
    'client/tactics.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/ai_behavior.lua',
    'server/dispatch.lua',
    'server/main.lua',
    'server/ai_manager.lua',
    'server/bridge.lua',
    'server/sync.lua'
}

dependencies {
    'qb-core',
    'civil_core'
}
