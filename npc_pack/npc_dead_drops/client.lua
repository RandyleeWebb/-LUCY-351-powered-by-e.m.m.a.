
local dropActive = false
local dropBlip = nil
local dropCoords = nil

RegisterNetEvent("npc_dead_drops:spawnDrop")
AddEventHandler("npc_dead_drops:spawnDrop", function(coords)
    dropActive = true
    dropCoords = coords
    dropBlip = AddBlipForCoord(coords)
    SetBlipSprite(dropBlip, 586)
    SetBlipColour(dropBlip, 2)
    SetBlipScale(dropBlip, 0.9)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString("Dead Drop")
    EndTextCommandSetBlipName(dropBlip)
end)

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if dropActive and dropCoords then
            local player = PlayerPedId()
            local pos = GetEntityCoords(player)
            if #(pos - dropCoords) < Config.PickupRadius then
                DrawText3D(dropCoords.x, dropCoords.y, dropCoords.z + 1.0, "[E] Grab the Drop")
                if IsControlJustReleased(0, 38) then -- E
                    dropActive = false
                    if dropBlip then RemoveBlip(dropBlip) end
                    TriggerServerEvent("npc_dead_drops:pickup")
                end
            end
        end
    end
end)

RegisterNetEvent("npc_dead_drops:notifyHunt")
AddEventHandler("npc_dead_drops:notifyHunt", function()
    Citizen.SetTimeout(Config.HuntDelay * 1000, function()
        TriggerEvent("chat:addMessage", {
            args = {"Drop", "A rival crew is hunting you for that bag!"}
        })
        -- You can add NPC attackers here later
    end)
end)

function DrawText3D(x, y, z, text)
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    ClearDrawOrigin()
end
