
local garbagePed = nil
local currentBlip = nil
local currentIndex = 1

CreateThread(function()
    local model = GetHashKey("s_m_y_garbage")
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    garbagePed = CreatePed(4, model, Config.StartLocation.x, Config.StartLocation.y, Config.StartLocation.z - 1.0, 270.0, false, true)
    SetEntityInvincible(garbagePed, true)
    SetBlockingOfNonTemporaryEvents(garbagePed, true)
    FreezeEntityPosition(garbagePed, true)

    exports['qb-target']:AddTargetEntity(garbagePed, {
        options = {
            {
                label = "Start Garbage Job",
                icon = "fas fa-dumpster",
                action = function()
                    TriggerServerEvent("npc_garbage_job:getStart")
                end
            }
        },
        distance = 2.5
    })
end)

RegisterNetEvent("npc_garbage_job:startRoute")
AddEventHandler("npc_garbage_job:startRoute", function()
    currentIndex = 1
    SetNextGarbageBlip()
end)

function SetNextGarbageBlip()
    if currentIndex > #Config.GarbagePoints then
        TriggerEvent("chat:addMessage", { args = { "Job", "Garbage route completed!" } })
        RemoveBlip(currentBlip)
        return
    end

    if currentBlip then RemoveBlip(currentBlip) end
    local coords = Config.GarbagePoints[currentIndex]
    currentBlip = AddBlipForCoord(coords)
    SetBlipSprite(currentBlip, 318)
    SetBlipColour(currentBlip, 2)
    SetBlipRoute(currentBlip, true)

    CreateThread(function()
        while true do
            Wait(1000)
            local playerCoords = GetEntityCoords(PlayerPedId())
            if #(playerCoords - coords) < 5.0 then
                TriggerEvent("chat:addMessage", { args = { "Job", "Garbage collected." } })
                currentIndex = currentIndex + 1
                SetNextGarbageBlip()
                break
            end
        end
    end)
end
