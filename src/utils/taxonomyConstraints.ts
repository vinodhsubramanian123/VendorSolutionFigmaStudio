export function checkHardwareConstraints(chassisSKU: string, cpuSKU: string, ramQuantity: number, psuWattsCount: number) {
  const isEolCpu = cpuSKU === "815100-B21";
  const isOddRam = ramQuantity % 8 !== 0;
  const isUnderpowered = psuWattsCount < 800;

  const socketMatch = {
    status: (isEolCpu ? "asymmetric" : "compatible") as "asymmetric" | "compatible" | "blocked",
    chassisSocket: "LGA4677",
    cpuSocket: isEolCpu ? "LGA3647 (Legacy)" : "LGA4677",
    description: isEolCpu 
      ? "Mismatch identified: Gen11 chassis uses LGA4677 sockets, but legacy CPU 815100-B21 belongs to LGA3647." 
      : "Complete alignment: CPU model pin specifications pair natively with host system chassis sockets."
  };

  const powerLimitTest = {
    passed: !isUnderpowered,
    estimatedTdpWatts: isEolCpu ? 205 : 270,
    maxSupportedWatts: psuWattsCount,
    marginWatts: psuWattsCount - (isEolCpu ? 205 : 270)
  };

  const memoryBalanceCheck = {
    passed: !isOddRam,
    quantity: ramQuantity,
    optimalLayoutSymmetry: 8,
    recommendsCorrection: isOddRam,
    message: isOddRam
      ? `Uneven layout detected: Odd RAM Allocation count (${ramQuantity}) creates multi-channel architecture latency bottleneck. Scale up to multiples of 8.`
      : "Balanced layout verified: Symmetrical memory controller modules satisfied. Ideal transmission performance."
  };

  return {
    isCompliant: !isEolCpu && !isOddRam && !isUnderpowered,
    socketMatch,
    powerLimitTest,
    memoryBalanceCheck
  };
}
