-- Lightweight placeholder spawner for standalone gameplay feel.
-- It does not mass-spawn or take network ownership. It only adds local ambient peds near active mission areas later.
local spawned = {}

local function cleanupDead()
    for i = #spawned, 1, -1 do
        if not DoesEntityExist(spawned[i]) then
            table.remove(spawned, i)
        end
    end
end

CreateThread(function()
    while true do
        cleanupDead()
        Wait(15000)
    end
end)
