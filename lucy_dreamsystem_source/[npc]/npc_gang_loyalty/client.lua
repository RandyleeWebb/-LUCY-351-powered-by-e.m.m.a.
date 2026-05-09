RegisterCommand("gangstatus", function()
    for _, gang in ipairs(Config.GangKeys) do
        TriggerServerCallback("npc_gang_loyalty:get", function(loyalty)
            print("^2[" .. gang .. "] Loyalty: " .. loyalty .. "^0")
        end, gang)
    end
end)

exports("GetPlayerGangLoyalty", function(gang, cb)
    TriggerServerCallback("npc_gang_loyalty:get", function(loyalty)
        cb(loyalty)
    end, gang)
end)
