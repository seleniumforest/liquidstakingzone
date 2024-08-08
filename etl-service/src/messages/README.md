# Ways to stake assets on stride (technical)

There's several types of transactions: 

1) Old MsgLiquidStake - /Stridelabs.stride.stakeibc.MsgLiquidStake. Cannot be decoded with latest stridejs versions. DOES NOT PRODUCE liquid_stake EventLog. Example - BCF51A6DF52A89F7E5A7C51C01067B0EA6CC44AD68F771FA5E1B28FF6AF9742B
2) New MsgLiquidStake - /stride.stakeibc.MsgLiquidStake. Example - E704A66C5CAA404D9F814AEE3AB7B8B3CE0CADDA8999BA3DA6C66C41657258CE
3) Old autopilot tx - /ibc.core.channel.v1.MsgRecvPacket. { "autopilot" : {}} object is in packet.reciever field. Example - 86AA05843DA32FBD8BD3A94E85A90040C253D7CA3FB961F943890225C2419BD5
4) New autopilot tx - /ibc.core.channel.v1.MsgRecvPacket. Differs from old by json packet schema. { "autopilot" : {}} object is in packet.memo field. Example -
EB2C39EDDDB1E3F272000C1B937508C7BE7F5E667C1C81CE5877271F87BBC389

5) Separate modules. For zone which does not have interchain accounts

    - /stride.staketia.MsgLiquidStake - B2B27015E8AAC4306A91DACB93F167B2865E87538BC7C5ACCC612BD28378A727 
    - /stride.stakedym.MsgLiquidStake - 49B506703EFD828D4E66793B28F467C8B03F19AE774E70DF462330E6AD2A718B


6) /stride.stakeibc.MsgLSMLiquidStake - 7E127378C5FB37574AE099A7699B880225F1D81AD2F6D0B886284696D0172BE0