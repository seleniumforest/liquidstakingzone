-- CreateTable
CREATE TABLE "BlockHeader" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "BlockHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "txhash" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "height" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "txcode" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MsgLiquidStake" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "txhash" TEXT NOT NULL,
    "feeDenom" TEXT NOT NULL,
    "feeAmount" TEXT NOT NULL,
    "creator" TEXT NOT NULL,
    "txcode" INTEGER NOT NULL,
    "amountDenom" TEXT NOT NULL,
    "amountAmount" TEXT NOT NULL,
    "receivedStTokenDenom" TEXT NOT NULL,
    "receivedStTokenAmount" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "ibcSeq" TEXT DEFAULT '',

    CONSTRAINT "MsgLiquidStake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MsgRedeemStake" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "txhash" TEXT NOT NULL,
    "feeDenom" TEXT NOT NULL,
    "feeAmount" TEXT NOT NULL,
    "txcode" INTEGER NOT NULL,
    "creator" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "hostZone" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "zone" TEXT NOT NULL,

    CONSTRAINT "MsgRedeemStake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedemptionRate" (
    "id" SERIAL NOT NULL,
    "epochNumber" INTEGER NOT NULL,
    "dateStart" TIMESTAMP(3) NOT NULL,
    "dateEnd" TIMESTAMP(3) NOT NULL,
    "redemptionRate" DOUBLE PRECISION NOT NULL,
    "zone" TEXT NOT NULL,

    CONSTRAINT "RedemptionRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "coin" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "vsCurrency" TEXT NOT NULL,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonesInfo" (
    "id" SERIAL NOT NULL,
    "zone" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "coingeckoId" TEXT NOT NULL,
    "stAssetPool" INTEGER,
    "denom" TEXT NOT NULL,
    "stDenom" TEXT NOT NULL,
    "registryName" TEXT NOT NULL,
    "ticker" TEXT,

    CONSTRAINT "ZonesInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonesRestake" (
    "id" SERIAL NOT NULL,
    "txhash" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "txcode" INTEGER NOT NULL,
    "feeDenom" TEXT NOT NULL,
    "feeAmount" TEXT NOT NULL,
    "zone" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "amountDenom" TEXT NOT NULL,
    "amountAmount" TEXT NOT NULL,

    CONSTRAINT "ZonesRestake_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalanceHistory" (
    "id" SERIAL NOT NULL,
    "zone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "assetsDenom" TEXT NOT NULL,
    "assetsAmount" TEXT NOT NULL,

    CONSTRAINT "AccountBalanceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneralData" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "mcap" INTEGER NOT NULL,
    "vol" INTEGER NOT NULL,

    CONSTRAINT "GeneralData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RedemptionRate_epochNumber_zone_key" ON "RedemptionRate"("epochNumber", "zone");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesInfo_zone_key" ON "ZonesInfo"("zone");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesInfo_denom_key" ON "ZonesInfo"("denom");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesInfo_registryName_key" ON "ZonesInfo"("registryName");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesInfo_coingeckoId_key" ON "ZonesInfo"("coingeckoId");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesInfo_stDenom_key" ON "ZonesInfo"("stDenom");

-- CreateIndex
CREATE UNIQUE INDEX "ZonesRestake_zone_sequence_type_key" ON "ZonesRestake"("zone", "sequence", "type");
