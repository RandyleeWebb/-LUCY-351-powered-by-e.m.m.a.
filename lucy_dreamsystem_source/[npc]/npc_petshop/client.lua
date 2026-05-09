
local petShopPed = nil

CreateThread(function()
    local model = GetHashKey("a_m_y_business_01")
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    petShopPed = CreatePed(4, model, Config.PetShopLocation.x, Config.PetShopLocation.y, Config.PetShopLocation.z - 1.0, 90.0, false, true)
    SetEntityInvincible(petShopPed, true)
    SetBlockingOfNonTemporaryEvents(petShopPed, true)
    FreezeEntityPosition(petShopPed, true)

    exports['qb-target']:AddTargetEntity(petShopPed, {
        options = {
            {
                label = "Browse Pets",
                icon = "fas fa-dog",
                action = function()
                    OpenPetShop()
                end
            }
        },
        distance = 2.5
    })
end)

function OpenPetShop()
    QBCore.Functions.TriggerCallback("npc_petshop:getPets", function(pets)
        local menu = {}
        for _, pet in pairs(pets) do
            table.insert(menu, {
                header = pet.name .. " - $" .. pet.price,
                txt = "Adopt",
                params = {
                    event = "npc_petshop:spawnPet",
                    args = pet
                }
            })
        end
        exports['qb-menu']:openMenu(menu)
    end)
end

RegisterNetEvent("npc_petshop:spawnPet")
AddEventHandler("npc_petshop:spawnPet", function(pet)
    local model = GetHashKey(pet.model)
    RequestModel(model)
    while not HasModelLoaded(model) do Wait(0) end

    local coords = GetEntityCoords(PlayerPedId())
    local petPed = CreatePed(28, model, coords.x + 1.0, coords.y + 1.0, coords.z, 0.0, true, true)
    TaskFollowToOffsetOfEntity(petPed, PlayerPedId(), 1.5, 1.5, 0.0, 2.0, -1, 5.0, true)
    SetEntityAsMissionEntity(petPed, true, true)
    SetEntityInvincible(petPed, true)
    TriggerEvent("chat:addMessage", {
        args = { "Pet", "You adopted a " .. pet.name .. "!" }
    })
end)
