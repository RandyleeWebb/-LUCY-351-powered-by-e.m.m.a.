
local informants = {}

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(30000) -- Every 30 sec
        local ped = PlayerPedId()
        local coords = GetEntityCoords(ped)
        TriggerServerEvent("npc_informants:checkNearby", coords)
    end
end)

RegisterNetEvent("npc_informants:snitchWarning")
AddEventHandler("npc_informants:snitchWarning", function(informantNetId)
    local informant = NetToPed(informantNetId)
    if DoesEntityExist(informant) then
        TaskReactAndFleePed(informant, PlayerPedId())
        TriggerEvent("chat:addMessage", {
            args = {"Informant", "Someone just saw what you did and is calling the cops!"}
        })
    end
end)
