local function notify(message)
    TriggerEvent('chat:addMessage', {
        color = { 120, 180, 255 },
        args = { 'Lucy', tostring(message) }
    })
end

RegisterCommand(LucyConfig.MenuCommand, function()
    LucyMenuOpen = not LucyMenuOpen
    if LucyMenuOpen then
        notify('Lucy menu open. Use arrow keys/D-pad, Enter/A, Backspace/B.')
    end
end, false)

RegisterKeyMapping(LucyConfig.MenuCommand, 'Open Lucy menu', 'keyboard', 'F7')

RegisterCommand(LucyConfig.MissionCommand, function()
    TriggerServerEvent('lucy_framework:server:requestMission')
end, false)

RegisterCommand(LucyConfig.RoleCommand, function(_, args)
    local role = args[1] or LucyConfig.DefaultRole
    TriggerServerEvent('lucy_framework:server:setRole', role)
end, false)

CreateThread(function()
    Wait(2000)
    notify('Standalone framework online. Use /lucy or F7.')
end)
