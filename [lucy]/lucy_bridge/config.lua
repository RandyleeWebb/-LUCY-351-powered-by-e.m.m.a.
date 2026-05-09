LucyBridgeConfig = LucyBridgeConfig or {}

-- Main Lucy AI framework URL. Match the port printed by START_LUCY.bat.
-- This keeps Server Lucy linked to the main Lucy brain instead of becoming a separate brain.
LucyBridgeConfig.Endpoint = GetConvar('lucy_url', 'http://127.0.0.1:4141')

-- Keep this private on your server. The main Lucy app accepts this local default and the old dev defaults.
LucyBridgeConfig.SharedSecret = GetConvar('lucy_bridge_secret', 'lucy-local-dev')

LucyBridgeConfig.HeartbeatIntervalMs = 5000
LucyBridgeConfig.CommandPollIntervalMs = 2000
LucyBridgeConfig.Debug = true
