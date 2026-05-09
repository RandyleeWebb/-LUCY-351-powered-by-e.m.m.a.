
local shopPed = nil

CreateThread(function()
    local model = GetHashKey("s_m_y_dealer_01")
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    shopPed = CreatePed(4, model, Config.IDShopLocation.x, Config.IDShopLocation.y, Config.IDShopLocation.z - 1.0, 180.0, false, true)
    SetEntityInvincible(shopPed, true)
    SetBlockingOfNonTemporaryEvents(shopPed, true)
    FreezeEntityPosition(shopPed, true)

    exports['qb-target']:AddTargetEntity(shopPed, {
        options = {
            {
                label = "Buy Fake ID",
                icon = "fas fa-id-card",
                action = function()
                    OpenIDShop()
                end
            }
        },
        distance = 2.5
    })
end)

function OpenIDShop()
    QBCore.Functions.TriggerCallback("npc_fake_id_shop:getIDs", function(items)
        local menu = {}
        for _, item in pairs(items) do
            table.insert(menu, {
                header = item.label .. " - $" .. item.price,
                txt = "Create this ID",
                params = {
                    event = "npc_fake_id_shop:issueID",
                    args = item
                }
            })
        end
        exports['qb-menu']:openMenu(menu)
    end)
end

RegisterNetEvent("npc_fake_id_shop:issueID")
AddEventHandler("npc_fake_id_shop:issueID", function(item)
    TriggerServerEvent("inventory:server:AddItem", item.name, 1)
    TriggerEvent("chat:addMessage", {
        args = { "Fake ID", "You’ve received a " .. item.label }
    })
end)
