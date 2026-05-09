fx_version 'cerulean'
game 'gta5'

name 'ai_bridge'
author 'Civil Unrest Development'
description 'AI Communication Bridge for Civil Unrest Framework'
version '1.0.1'

shared_scripts {
    '@qb-core/shared/locale.lua',
    'config.lua'
}


client_script {
    'client.lua'
}

server_script {
    'server.lua'
}

dependencies {
    'qb-core',
    'qb-smallresources'
}

lua54 'yes'