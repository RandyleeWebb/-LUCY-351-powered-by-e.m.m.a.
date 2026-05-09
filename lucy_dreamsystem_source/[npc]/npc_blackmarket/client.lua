
local pedSpawned = false

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(10000)
        local hour = GetClockHours()
        if hour >= Config.NightHours.start or hour <= Config.NightHours.stop then
            if not pedSpawned then
                CreateBlackMarketNPC()
                pedSpawned = true
            end
        else
            if pedSpawned then
                DeleteBlackMarketNPC()
                pedSpawned = false
            end
        end
    end
end)

function CreateBlackMarketNPC()
    local model = GetHashKey(Config.NPCModel)
    RequestModel(model)
    while not HasModelLoaded(model) do Citizen.Wait(100) end

    local ped = CreatePed(4, model, Config.Location.x, Config.Location.y, Config.Location.z - 1.0, 0.0, false, true)
    SetEntityInvincible(ped, true)
    FreezeEntityPosition(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    TaskStartScenarioInPlace(ped, "WORLD_HUMAN_DRUG_DEALER_HARD", 0, true)

    exports['qb-target']:AddTargetEntity(ped, {
        options = {
            {
                label = "Access Black Market",
                icon = "fas fa-mask",
                action = function()
                    OpenMarketMenu()
                end
            }
        },
        distance = 2.5
    })

    blackMarketPed = ped
end

function DeleteBlackMarketNPC()
    if DoesEntityExist(blackMarketPed) then
        DeleteEntity(blackMarketPed)
    end
end

function OpenMarketMenu()
    QBCore.Functions.TriggerCallback("npc_blackmarket:getItems", function(items)
        local menu = {}
        for _, item in pairs(items) do
            table.insert(menu, {
                header = item.label .. " - $" .. item.price,
                txt = "Buy",
                params = {
                    event = "qb-inventory:client:purchaseItem",
                    args = { item = item.name, price = item.price }
                }
            })
        end
        exports['qb-menu']:openMenu(menu)
    end)
end
