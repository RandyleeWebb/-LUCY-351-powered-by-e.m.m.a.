local activeMissions = {}

local function notify(message)
    TriggerEvent('chat:addMessage', {
        color = { 120, 180, 255 },
        args = { 'Lucy', tostring(message) }
    })
end

RegisterNetEvent('lucy_bridge:client:mission', function(mission)
    mission = mission or {}
    local coords = mission.coords or { x = 215.76, y = -810.12, z = 30.73 }
    local item = {
        title = mission.title or 'Lucy Mission',
        objective = mission.objective or 'Reach the marked area.',
        reward = mission.reward or 250,
        coords = vector3(coords.x or 215.76, coords.y or -810.12, coords.z or 30.73),
        blip = nil
    }
    item.blip = AddBlipForCoord(item.coords.x, item.coords.y, item.coords.z)
    SetBlipSprite(item.blip, 280)
    SetBlipColour(item.blip, 3)
    SetBlipScale(item.blip, 0.85)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString(item.title)
    EndTextCommandSetBlipName(item.blip)
    table.insert(activeMissions, item)
    notify(item.title .. ': ' .. item.objective)
end)

CreateThread(function()
    while true do
        local sleep = 1000
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        for i = #activeMissions, 1, -1 do
            local mission = activeMissions[i]
            local dist = #(pos - mission.coords)
            if dist < 80.0 then
                sleep = 0
                DrawMarker(1, mission.coords.x, mission.coords.y, mission.coords.z - 1.0, 0, 0, 0, 0, 0, 0, 3.0, 3.0, 0.8, 80, 160, 255, 130, false, true, 2, nil, nil, false)
                if dist < 3.0 then
                    BeginTextCommandDisplayHelp('STRING')
                    AddTextComponentSubstringPlayerName('Press ~INPUT_CONTEXT~ to complete Lucy mission')
                    EndTextCommandDisplayHelp(0, false, true, 1)
                    if IsControlJustPressed(0, 38) then
                        if mission.blip then RemoveBlip(mission.blip) end
                        notify('Mission complete. Reward target: $' .. tostring(mission.reward))
                        table.remove(activeMissions, i)
                    end
                end
            end
        end
        Wait(sleep)
    end
end)
