
local inZone = false

CreateThread(function()
    while true do
        Wait(500)
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        if #(coords - Config.BunkerEntry) < 2.5 then
            inZone = true
            DrawText3D(Config.BunkerEntry.x, Config.BunkerEntry.y, Config.BunkerEntry.z, "[E] Enter Secret Bunker")
            if IsControlJustReleased(0, 38) then
                TriggerServerEvent("npc_secret_bunker:checkAccess")
                Wait(3000)
            end
        else
            inZone = false
        end
    end
end)

RegisterNetEvent("npc_secret_bunker:teleport")
AddEventHandler("npc_secret_bunker:teleport", function()
    SetEntityCoords(PlayerPedId(), Config.BunkerInterior.x, Config.BunkerInterior.y, Config.BunkerInterior.z)
    TriggerEvent("chat:addMessage", { args = { "Bunker", "Welcome to the hidden base." } })
end)

function DrawText3D(x, y, z, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    local p, q, r = GetActiveScreenResolution()
    if onScreen then
        SetTextScale(0.35, 0.35)
        SetTextFont(4)
        SetTextProportional(1)
        SetTextColour(255, 255, 255, 215)
        SetTextEntry("STRING")
        SetTextCentre(1)
        AddTextComponentString(text)
        DrawText(_x, _y)
    end
end
