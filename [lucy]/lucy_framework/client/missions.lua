local activeMission = nil

local function notify(message)
    TriggerEvent('chat:addMessage', {
        color = { 120, 180, 255 },
        args = { 'Lucy', tostring(message) }
    })
end

RegisterNetEvent('lucy_framework:client:missionAssigned', function(mission)
    if activeMission and activeMission.blip then
        RemoveBlip(activeMission.blip)
    end
    local coords = mission.coords or { x = 215.76, y = -810.12, z = 30.73 }
    activeMission = mission
    activeMission.coordsVec = vector3(coords.x, coords.y, coords.z)
    activeMission.blip = AddBlipForCoord(coords.x, coords.y, coords.z)
    SetBlipSprite(activeMission.blip, 280)
    SetBlipColour(activeMission.blip, 2)
    SetBlipScale(activeMission.blip, 0.9)
    SetBlipRoute(activeMission.blip, true)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString(mission.title or 'Lucy Mission')
    EndTextCommandSetBlipName(activeMission.blip)
    notify((mission.title or 'Lucy Mission') .. ': ' .. (mission.objective or 'Complete the objective.'))
end)

CreateThread(function()
    while true do
        local sleep = 1000
        if activeMission and activeMission.coordsVec then
            local ped = PlayerPedId()
            local pos = GetEntityCoords(ped)
            local dist = #(pos - activeMission.coordsVec)
            if dist < 90.0 then
                sleep = 0
                DrawMarker(1, activeMission.coordsVec.x, activeMission.coordsVec.y, activeMission.coordsVec.z - 1.0, 0, 0, 0, 0, 0, 0, 3.2, 3.2, 0.85, 120, 255, 180, 135, false, true, 2, nil, nil, false)
                if dist < 3.2 then
                    BeginTextCommandDisplayHelp('STRING')
                    AddTextComponentSubstringPlayerName('Press ~INPUT_CONTEXT~ to complete Lucy mission')
                    EndTextCommandDisplayHelp(0, false, true, 1)
                    if IsControlJustPressed(0, 38) then
                        TriggerServerEvent('lucy_framework:server:completeMission', activeMission.id)
                        if activeMission.blip then RemoveBlip(activeMission.blip) end
                        activeMission = nil
                    end
                end
            end
        end
        Wait(sleep)
    end
end)
