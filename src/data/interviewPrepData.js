// Interview Prep Q&A Data — extracted from Apple Firmware Interview Prep Schedule
// Organized by week and day for structured study

const interviewPrepData = [
  {
    week: 1,
    title: 'Cortex-M4F Deep Mastery + EFR32BG13 Toolchain',
    phase: 'Phase 1 — Foundation',
    questions: [
      {
        id: 'w1d1',
        day: 'Mon',
        topic: 'Cortex-M4F pipeline, NVIC & exception model',
        reading: [
          'ARM Cortex-M4F TRM §2.1–2.3: 3-stage pipeline',
          'ARM Cortex-M4F TRM §B1.5: NVIC — 8-bit priority, preemption, tail-chaining, late-arrival',
          'Key M4F facts: no TrustZone, 8-region MPU, optional FPU',
        ],
        question:
          'Walk me through what happens cycle-by-cycle when an interrupt fires on Cortex-M4F.',
        referenceAnswer:
          'CPU completes current instruction. Hardware pushes xPSR/PC/LR/r12/r3-r0 (~12 cycles). NVIC fetches ISR vector. Tail-chaining: skips pop+push for back-to-back IRQs. Late-arrival: switches to higher-priority IRQ during push.',
      },
      {
        id: 'w1d2',
        day: 'Tue',
        topic: 'UART printf + GPIO interrupt stub',
        reading: [
          'EFR32BG13 Reference Manual: CMU + USART registers',
          'UART USART0 at 115200 configuration',
          'GPIO interrupt configuration',
        ],
        question: 'Why should you never call printf() or malloc() inside an ISR?',
        referenceAnswer:
          'printf() uses global FILE buffer — not reentrant. malloc() acquires heap lock — deadlocks if main holds it. ISRs must be minimal: set flag, post queue, use FromISR APIs only.',
      },
      {
        id: 'w1d3',
        day: 'Wed',
        topic: 'EFR32BG13 clocking tree (CMU) & power domains',
        reading: [
          'EFR32BG13 RM §CMU: HFXO (38.4 MHz, required for BLE) vs HFRCO (internal, ±1%)',
          'Clock tree hierarchy',
          'EFR32BG13 RM §EMU: EM0-EM4 energy modes',
        ],
        question: 'What is the difference between HFXO and HFRCO on EFR32BG13?',
        referenceAnswer:
          'HFXO: external 38.4 MHz crystal, ±20 ppm, mandatory for BLE. ~1 ms startup. HFRCO: internal RC, ±1%, zero startup, lower current. BLE radio sequencer automates the switch.',
      },
      {
        id: 'w1d4',
        day: 'Thu',
        topic: 'ARM M4F memory map & MPU (8 regions)',
        reading: [
          'ARM M4F TRM §B3: memory map — code, SRAM, peripheral, PPB regions',
          'ARM M4F TRM §B3.5: MPU — 8 regions, XN bit, privilege levels',
          'RASR/RBAR layout',
        ],
        question: 'What is the MPU on Cortex-M4 and give a concrete use case?',
        referenceAnswer:
          'MPU enforces per-region access rules. Use case: mark stack as XN — MemManage fault if PC jumps into stack. FreeRTOS MPU port isolates task stacks.',
      },
      {
        id: 'w1d5',
        day: 'Fri',
        topic: 'Linker scripts, LMA vs VMA, boot sequence',
        reading: [
          'GNU LD: MEMORY regions, SECTIONS, LMA vs VMA, AT> directive',
          'EFR32BG13 startup: reset handler copies .data, zeroes .bss, calls main()',
        ],
        question: 'Explain LMA vs VMA and how .data initialisation works at boot.',
        referenceAnswer:
          'LMA = physical storage in flash. VMA = runtime address in SRAM. Startup copies from *data_load (flash) to *data_start (SRAM). .bss zeroed separately. Without copy loop, .data reads garbage.',
      },
    ],
  },
  {
    week: 2,
    title: 'Memory Architecture, Flash & FreeRTOS Bring-Up + I2S Investigation',
    phase: 'Phase 1 — Foundation',
    questions: [
      {
        id: 'w2d1',
        day: 'Mon',
        topic: 'EFR32BG13 flash controller (MSC) & NVM internals',
        reading: [
          'EFR32BG13 RM §MSC: 2 KB page size, write timing (~40 µs/word), erase (~21 ms/page), lock bits',
          'Flash cells only go 1→0 on write',
        ],
        question: 'Why can flash only be written 1→0, and what does this mean for firmware design?',
        referenceAnswer:
          'Floating-gate transistors: \'1\' = no charge, \'0\' = charge trapped. Erase removes charge from entire page. Implications: never partially overwrite, wear leveling needed, NVM3 manages this.',
      },
      {
        id: 'w2d2',
        day: 'Tue',
        topic: 'FreeRTOS bring-up on EFR32BG13',
        reading: [
          'FreeRTOS docs for FreeRTOSConfig.h #define values',
          'FreeRTOS heap management schemes (heap_1 through heap_5)',
        ],
        question: 'What is configTOTAL_HEAP_SIZE and what happens when heap is exhausted?',
        referenceAnswer:
          'FreeRTOS manages its own heap for task stacks, queues, etc. When exhausted, pvPortMalloc() returns NULL. Always check xTaskCreate return value with configASSERT. Monitor with xPortGetFreeHeapSize().',
      },
      {
        id: 'w2d3',
        day: 'Wed',
        topic: 'FreeRTOS scheduler internals + I2S register investigation',
        reading: [
          'FreeRTOS source: ready list, delayed list, SysTick calls xTaskIncrementTick(), PendSV does context switch',
          'Silicon Labs community threads on USART1 I2S register config issue on BG13',
        ],
        question:
          'Why does FreeRTOS use PendSV for context switching instead of doing it directly in SysTick?',
        referenceAnswer:
          'SysTick at high priority would block ISRs during the full context switch. PendSV at lowest priority: SysTick sets PENDSVSET bit, PendSV fires only after all higher-priority ISRs complete.',
      },
      {
        id: 'w2d4',
        day: 'Thu',
        topic: 'FreeRTOS queues, mutexes & priority inversion',
        reading: [
          'Queue internals: copies by value',
          'Mutex has ownership + priority inheritance',
          'Priority inversion: Mars Pathfinder bug',
        ],
        question:
          'Explain the Mars Pathfinder priority inversion bug and how FreeRTOS prevents it.',
        referenceAnswer:
          '1997: high-priority task starved because low task held mutex, medium task ran continuously. Fix applied in flight: enable priority inheritance. FreeRTOS: mutex holder temporarily gets blocked task\'s priority.',
      },
      {
        id: 'w2d5',
        day: 'Fri',
        topic: 'Stack overflow detection & heap sizing',
        reading: [
          'configCHECK_FOR_STACK_OVERFLOW mode 2: fills stack with 0xA5A5A5A5, checks last 20 bytes at every context switch',
          'uxTaskGetStackHighWaterMark() for sizing',
        ],
        question: 'How does FreeRTOS stack overflow detection mode 2 work, and what can it miss?',
        referenceAnswer:
          'Fills stack with 0xA5 at creation. Checks last 20 bytes each context switch. Can miss: overflow between switches that gets overwritten, overflow not reaching sentinel zone, infrequent tasks.',
      },
    ],
  },
  {
    week: 3,
    title: 'LDMA, DMA Architecture & I2S Bring-Up',
    phase: 'Phase 1 — Foundation',
    questions: [
      {
        id: 'w3d1',
        day: 'Mon',
        topic: 'EFR32BG13 LDMA architecture',
        reading: [
          'EFR32BG13 RM §LDMA: linked descriptors, CTRL fields, XFER/SYNC/WRI types',
          'Channel arbitration, peripheral request signals',
        ],
        question:
          'Walk me through how LDMA ping-pong works at the descriptor level for I2S audio capture.',
        referenceAnswer:
          'Two descriptors: DescA→BufferA links to DescB, DescB→BufferB links back to DescA. On completion: IRQ fires, ISR posts buffer pointer via xQueueSendFromISR. LDMA autonomously fetches next descriptor.',
      },
      {
        id: 'w3d2',
        day: 'Tue',
        topic: 'Ping-pong DMA on UART RX',
        reading: [
          'LDMA ping-pong on USART0 RX: two 64-byte buffers, alternating descriptors',
          'ISR: post buffer to FreeRTOS queue, track missed_frames',
        ],
        question: 'Why is ping-pong DMA superior to interrupt-driven byte reception for audio?',
        referenceAnswer:
          'Interrupt-driven: 32,000 IRQs/sec at 16 kHz stereo. Ping-pong: 125 IRQs/sec (one per 256-sample block). CPU free for full frame period. Low IRQ rate preserves FreeRTOS task timing.',
      },
      {
        id: 'w3d3',
        day: 'Wed',
        topic: 'ISR latency, critical sections & DWT measurement',
        reading: [
          'ARM M4F: 12-cycle interrupt latency',
          'FPU lazy stacking: defers S0-S15 push. Disable with FPCCR &= ~LSPEN',
          'FreeRTOS BASEPRI critical sections',
        ],
        question: 'What is FPU lazy stacking on Cortex-M4F and when would you disable it?',
        referenceAnswer:
          'Lazy stacking reserves space for FP regs but doesn\'t push until ISR uses FPU instruction. Disable LSPEN when ISR always uses FPU and needs deterministic latency.',
      },
      {
        id: 'w3d4',
        day: 'Thu',
        topic: 'I2S protocol deep dive + SPH0645/ICS-43434 mic wiring',
        reading: [
          'I2S spec: BCLK, LRCK, DATA timing. BCLK = 2 × sample_rate × bits_per_frame',
          'Mic datasheet: 18-bit left-justified in 24-bit slot',
          'EFR32BG13 USART I2S mode + USART1 workaround',
        ],
        question: 'Calculate BCLK for 16 kHz stereo with 32-bit frames.',
        referenceAnswer:
          'BCLK = 16000 × 2 × 32 = 1.024 MHz. LRCK = 16 kHz. SPH0645: 18-bit in bits[31:14], extract via raw32 >> 14, sign-extend bit 17.',
      },
      {
        id: 'w3d5',
        day: 'Fri',
        topic: 'I2S DMA pipeline + Mic Sampler task',
        reading: [
          'LDMA + USART I2S: RXDATAV request signal, 256 triggers per buffer, ping-pong continuous capture',
        ],
        question: 'Your I2S pipeline drops frames after 20 min. Walk through your debug process.',
        referenceAnswer:
          '1) missed_frames counter in LDMA IRQ. 2) Check heap fragmentation. 3) vTaskGetRunTimeStats for CPU share. 4) GPIO trace: IRQ timing vs queue post. 5) Check NVM3 repack blocking audio path.',
      },
    ],
  },
  {
    week: 4,
    title: 'Audio Pipeline Complete + Scope Decision Gate',
    phase: 'Phase 1 — Foundation',
    questions: [
      {
        id: 'w4d1',
        day: 'Mon',
        topic: 'MAX98357A DAC + I2S TX path',
        reading: [
          'MAX98357A datasheet: I2S slave input, SD_MODE pin, 3.2W into 4Ω',
          'Must provide valid BCLK/LRCK even during silence',
        ],
        question: 'What happens to MAX98357A output if BCLK stops mid-playback?',
        referenceAnswer:
          'Amp loses I2S sync, output goes to mid-supply rail — loud click/pop. Correct: never stop BCLK, send zero samples for silence. Only gate BCLK after SD_MODE=GND shutdown.',
      },
      {
        id: 'w4d2',
        day: 'Tue',
        topic: 'End-to-end transparency mode v0',
        reading: [
          'Mic Sampler → Audio Processor → I2S TX DMA pipeline',
          'Latency measurement and queue depth tuning',
        ],
        question: 'What is the one-way latency budget for transparency mode?',
        referenceAnswer:
          'Budget: DMA block = 256/16000 = 16 ms (dominant). Queue + DAC ~1-2 ms. Total ~17-18 ms. Reduce: shrink to 128 samples = 8 ms. AirPods achieves <1 ms via dedicated hardware.',
      },
      {
        id: 'w4d3',
        day: 'Wed',
        topic: 'Adaptive gain control + CMSIS-DSP',
        reading: [
          'CMSIS-DSP: arm_rms_f32, arm_biquad_cascade_df1_f32',
          'M4F FPU: 1-cycle FADD/FMUL',
          'Adaptive gain: RMS-based, ±1 dB/frame slew limit',
        ],
        question: 'Why limit gain to ±1 dB per frame instead of jumping to target?',
        referenceAnswer:
          'Abrupt gain = audible click/pumping. Asymmetry: fast attack (-2 dB/frame) protects hearing, slow release (+1 dB/frame) prevents pumping between transients.',
      },
      {
        id: 'w4d4',
        day: 'Thu',
        topic: 'Wind noise detection via FFT',
        reading: [
          'CMSIS-DSP arm_rfft_fast_f32: N/2 complex bins',
          'Wind metric: high-freq energy ratio',
          'AudioConfig struct with mutex',
        ],
        question: 'Why use energy ratio for wind detection rather than absolute threshold?',
        referenceAnswer:
          'Absolute fails: loud broadband = false positive, quiet environment = misses wind. Ratio is self-normalising: wind has flat/rising spectrum, speech dominated by low-freq fundamentals.',
      },
      {
        id: 'w4d5',
        day: 'Fri',
        topic: 'Scope Decision Gate + BLE GATT + NVM3',
        reading: [
          'BLE GATT hierarchy',
          'NVM3: key-value store with wear leveling',
          'Version A vs Version B decision criteria',
        ],
        question: 'What is NVM3 wear leveling and why is it necessary?',
        referenceAnswer:
          'Flash rated ~10K erase cycles per page. NVM3 circular log across pages distributes wear. Repack (compaction) is the only blocking operation — run in lower-priority task.',
      },
    ],
  },
  {
    week: 5,
    title: 'EM2 Power Management + Bootloader + Fault Handling',
    phase: 'Phase 2 — Core Project Build',
    questions: [
      {
        id: 'w5d1',
        day: 'Mon',
        topic: 'EFR32BG13 energy modes — detailed',
        reading: [
          'EFR32BG13 RM §EMU: EM0 (~5.5 mA), EM1 (~1 mA), EM2 (~2-3 µA), EM3 (no LFXO), EM4 (~0.1 µA)',
          'BG13 BLE requires EM2 minimum',
        ],
        question: 'Why can\'t you use EM3 on EFR32BG13 with active BLE?',
        referenceAnswer:
          'EM3 stops LFXO. BLE needs ±50 ppm timing for connection events. Only ULFRCO (±2%) available in EM3 — too inaccurate. EM2 keeps LFXO at 32.768 kHz.',
      },
      {
        id: 'w5d2',
        day: 'Tue',
        topic: 'Peripheral clock gating + current measurement',
        reading: [
          'CMU_ClockEnable(false) for unused peripherals',
          'Energy Profiler usage for active frame vs EM2 current',
        ],
        question: 'What is the difference between clock gating and power gating?',
        referenceAnswer:
          'Clock gating: stops clock, state retained, instant re-enable, leakage remains. Power gating: disconnects VDD, state lost, slower re-enable, zero leakage. EM2 uses clock gating.',
      },
      {
        id: 'w5d3',
        day: 'Wed',
        topic: 'CRC bootloader + anti-rollback',
        reading: [
          'Bootloader at 0x0, app at 0x4000',
          'Image header: magic, version, crc32, length',
          'Anti-rollback: minimum_version in flash',
        ],
        question:
          'Your CRC bootloader rejects an image in the field. What are all possible causes?',
        referenceAnswer:
          '1) Flash corruption, 2) Incomplete OTA, 3) Wrong image for hardware variant, 4) CRC miscalculated at build, 5) Anti-rollback version too old, 6) Header at wrong offset.',
      },
      {
        id: 'w5d4',
        day: 'Thu',
        topic: 'Fault handling on Cortex-M4F',
        reading: [
          'ARM M4F TRM: CFSR (MMFSR+BFSR+UFSR), HFSR, MMFAR, BFAR',
          'Key bits: PRECISERR, IMPRECISERR, INVSTATE, NOCP',
          'Exception frame: PC-at-fault at frame[6]',
        ],
        question: 'CFSR=0x00008200, BFAR=0x40010000. What failed?',
        referenceAnswer:
          'BFSR=0x82: BFARVALID + PRECISERR. Precise bus fault at peripheral address 0x40010000. Likely: accessing clock-gated peripheral or unmapped address. Check disassembly around faulting PC.',
      },
      {
        id: 'w5d5',
        day: 'Fri',
        topic: 'Watchdog + multi-task liveness monitoring',
        reading: [
          'EFR32BG13 WDOG: PERSEL timeouts, lock register',
          'Production pattern: bitmask per task, dedicated petter task checks all bits',
        ],
        question: 'How do you implement a multi-task watchdog monitor in a FreeRTOS system?',
        referenceAnswer:
          '32-bit xWatchdogBits: each task sets its bit periodically. WatchdogPetter task checks all expected bits are set → WDOG_Feed(), then clears mask. If any task misses its check-in, petter doesn\'t feed → system reset.',
      },
    ],
  },
  {
    week: 6,
    title: 'BLE Deep Dive + System Integration',
    phase: 'Phase 2 — Core Project Build',
    questions: [
      {
        id: 'w6d1',
        day: 'Mon',
        topic: 'BLE connection parameters & power tradeoffs',
        reading: [
          'BLE: CI (7.5ms-4s), slave latency, supervision timeout',
          'Power model: avg current ≈ peak_rx × 1/(SL+1) × event_duration/CI',
        ],
        question:
          'A wearable needs 500ms audio level streaming and <2s config response. What BLE params?',
        referenceAnswer:
          'CI=500ms, SL=3: worst-case config latency = 4×500ms = 2000ms. 75% radio duty reduction. Use Write With Response for config writes.',
      },
      {
        id: 'w6d2',
        day: 'Tue',
        topic: 'GATT notifications + BLE security',
        reading: [
          'BLE Manager: CCCD writes, notifications on wind_detected change',
          'Just Works pairing, bonding, auto-reconnect',
        ],
        question:
          'BLE peripheral sends notifications but phone never receives them. What do you check?',
        referenceAnswer:
          '1) CCCD must be 0x0001. 2) CI + SL timing. 3) MTU: payload ≤ MTU-3. 4) Check send_notification return code. 5) Verify connection handle is current.',
      },
      {
        id: 'w6d3',
        day: 'Wed',
        topic: 'SPI & I2C driver fundamentals',
        reading: [
          'I2C: open-drain, 7-bit addr, ACK/NACK, clock stretching, bus lockup',
          'SPI: full-duplex, 4-wire, CPOL/CPHA modes',
        ],
        question: 'I2C: slave holds SDA low. What caused it and how do you recover?',
        referenceAnswer:
          'Slave mid-byte when master reset. Recovery: release SDA, 9 SCL pulses via GPIO, check SDA each pulse, generate STOP, re-init peripheral.',
      },
      {
        id: 'w6d4',
        day: 'Thu',
        topic: 'OTA firmware update architecture',
        reading: [
          'Single-bank (dangerous) vs dual-bank A/B (power-fail safe)',
          'Delta updates, CRC32 vs ECDSA-P256 verification',
          'Anti-rollback: monotonic counter, boot counter for crash recovery',
        ],
        question: 'Why is dual-bank OTA preferred over single-bank?',
        referenceAnswer:
          'Single-bank: power fail mid-write = bricked device. Dual-bank: new image written to inactive bank, active untouched. Swap is atomic flag write. Power fail during download = safe.',
      },
      {
        id: 'w6d5',
        day: 'Fri',
        topic: 'Full system integration + GPIO trace',
        reading: [
          'GPIO trace: PA5=LDMA IRQ, PA6=AudioProcessor, PA7=BLE Manager, PB0=EM2 sleep',
          '4-channel logic analyzer capture',
        ],
        question: 'How would you debug BLE throughput degradation when audio pipeline is active?',
        referenceAnswer:
          'GPIO trace first: is BLE Manager getting CPU time? Check mutex hold times. Check if BLE radio event coincides with LDMA IRQ critical section. Ensure configMAX_SYSCALL_INTERRUPT_PRIORITY doesn\'t mask BLE radio IRQ.',
      },
    ],
  },
  {
    week: 7,
    title: 'System Design Mastery (PROTECT THIS WEEK)',
    phase: 'Phase 2 — Core Project Build',
    questions: [
      {
        id: 'w7d1',
        day: 'Mon',
        topic: 'System design framework — 8 dimensions',
        reading: [
          'Apple system design framework: (1) Requirements, (2) HW block diagram, (3) SW/task architecture',
          '(4) Data flow, (5) Memory layout, (6) Power budget, (7) Security, (8) Failure modes',
        ],
        question: 'Design a BLE wearable audio transparency firmware from scratch.',
        referenceAnswer:
          'Requirements: stereo, <20ms latency, BLE config, 6hr battery, secure OTA. Tasks: MicSampler, AudioDSP, BLEManager, PowerManager. DMA ping-pong 256 samples at 16kHz. EM2 between frames. Dual-bank OTA with CRC. Watchdog bitmask.',
      },
      {
        id: 'w7d2',
        day: 'Tue',
        topic: 'DWT benchmarking + performance analysis',
        reading: [
          'DWT cycle counter for benchmarking: arm_rms_f32, arm_rfft_fast_f32, gain multiply, context switch, xQueueSend',
          'Frame time budget: <4ms = headroom, >12ms = problem',
        ],
        question: 'Audio DSP consuming 80% CPU per frame. How do you optimize?',
        referenceAnswer:
          '1) DWT benchmark each operation. 2) Reduce FFT to 128. 3) Run FFT every 4th frame. 4) Reduce sample rate as last resort. 5) Temporarily boost BLE task priority during connection events.',
      },
      {
        id: 'w7d3',
        day: 'Wed',
        topic: 'Cache coherency & memory consistency',
        reading: [
          'M4F: no data cache, DMA/CPU always consistent',
          'Cortex-A: L1/L2 cache requires SCB_CleanDCache / SCB_InvalidateDCache around DMA transfers',
        ],
        question:
          'On a Cortex-A with D-cache, you start DMA TX from a buffer CPU just wrote. What can go wrong?',
        referenceAnswer:
          'CPU write went to L1 cache, DMA reads stale DRAM. Fix: SCB_CleanDCache_by_Addr before TX. Symmetric RX: SCB_InvalidateDCache_by_Addr after RX. M4F: no cache, no problem.',
      },
      {
        id: 'w7d4',
        day: 'Thu',
        topic: 'Low-power sensor hub architecture',
        reading: [
          'Apple Watch pattern: always-on SoC for sensors, main SoC sleeps 99%',
          'Power budget methodology: enumerate subsystems → duty cycle each → sum averages',
        ],
        question: 'How would you architect firmware for a 7-day wearable on 100mAh?',
        referenceAnswer:
          '595µA budget. BLE ~20µA, accel ~50µA, HR ~100µA (gated by motion), MCU ~53µA. Total ~223µA. HR sensor dominant — use accel as motion gate to reduce HR duty 60%.',
      },
      {
        id: 'w7d5',
        day: 'Fri',
        topic: 'ANC architecture (conceptual)',
        reading: [
          'ANC: feedforward mic (outside, 2-5ms budget), feedback mic (inside, <0.5ms)',
          'FxLMS adaptive filter',
          'Requires dedicated DSP — not achievable on EFR32BG13',
        ],
        question: 'AirPods Pro uses both feedforward and feedback ANC. Why both?',
        referenceAnswer:
          'Feedforward: handles broadband exterior noise with complex filter (enough time). Feedback: closed-loop correction for seal variation with fast simple filter. Hybrid: robust across users and fit.',
      },
    ],
  },
  {
    week: 8,
    title: 'Production Hardening + Debug Tooling',
    phase: 'Phase 2 — Core Project Build',
    questions: [
      {
        id: 'w8d1',
        day: 'Mon',
        topic: 'ITM/SWO trace + debug output',
        reading: [
          'ARM CoreSight: ITM 32 stimulus ports, non-blocking writes',
          'SWO carries output to J-Link. DWT: cycle counter, hardware watchpoints',
        ],
        question: 'What is the advantage of ITM/SWO over UART for timing-critical debug?',
        referenceAnswer:
          'UART: blocking, introduces timing perturbation (Heisenbug). ITM: fire-and-forget (1 cycle write), silent drop if FIFO full. ~400KB/s at 4MHz SWO. Multiple ports for categorization.',
      },
      {
        id: 'w8d2',
        day: 'Tue',
        topic: 'Static analysis + secure coding audit',
        reading: [
          'GCC flags: -Wall -Wextra -Wformat=2 -Wstack-usage=512 -fstack-protector-strong',
          'Audit: magic numbers, return value checks, no malloc in audio path, shared variable protection',
        ],
        question: 'What is -fstack-protector-strong?',
        referenceAnswer:
          'GCC inserts canary between local buffers and saved return address. On return, checks canary. Buffer overflow overwrites canary → __stack_chk_fail fires. Defends against BLE data overflow attacks.',
      },
      {
        id: 'w8d3',
        day: 'Wed',
        topic: 'UART framing + COBS protocol',
        reading: [
          'Binary framing: length-prefix vs delimiter-based vs COBS',
          'COBS: eliminates 0x00 from payload, uses 0x00 as unambiguous delimiter, O(N), max 1 byte overhead per 254',
        ],
        question:
          'Why is delimiter-based framing unreliable for binary data? How does COBS solve it?',
        referenceAnswer:
          'Delimiter byte in payload = false frame boundary. COBS: encodes runs so 0x00 never appears in output. Clean 0x00 delimiter. O(N), ~0.4% overhead.',
      },
      {
        id: 'w8d4',
        day: 'Thu',
        topic: 'PMIC interaction & power sequencing',
        reading: [
          'PMIC: multiple rails, I2C/SPI control, DVFS',
          'Startup sequence: V_IO before V_AUD to prevent latch-up',
          'Latch-up: parasitic thyristor triggers when I/O driven outside VDD range',
        ],
        question: 'What is latch-up and how does power sequencing prevent it?',
        referenceAnswer:
          'Parasitic PNP+NPN in CMOS. I/O pin driven outside [GND-0.3V, VDD+0.3V] triggers thyristor. Fix: power V_IO before applying signals, reverse order on shutdown.',
      },
      {
        id: 'w8d5',
        day: 'Fri',
        topic: 'Code architecture review + HAL design',
        reading: [
          'HAL principles: no raw register access from app code, no magic numbers',
          'Error return codes, no dynamic allocation in audio path',
          'Module boundaries: audio_hal.h/c, ble_manager.h/c, power_manager.h/c',
        ],
        question: 'Why should dynamic allocation be forbidden in the audio path after init?',
        referenceAnswer:
          '1) Non-deterministic latency from heap search. 2) Fragmentation over hours → malloc returns NULL. 3) No safe failure recovery mid-frame. Solution: static arrays or fixed-size block pools.',
      },
    ],
  },
  {
    week: 9,
    title: 'Interview Narrative + Deep Technical Drill',
    phase: 'Phase 2 — Core Project Build',
    questions: [
      {
        id: 'w9d1',
        day: 'Mon',
        topic: 'ARM M4F exception model — complete + cross-functional STAR story',
        reading: [
          'ARM M4F TRM §B1.5: all exception types, EXC_RETURN value, Thread vs Handler mode, SPSEL bit',
        ],
        question: 'What is EXC_RETURN and why does it matter for HardFault handlers?',
        referenceAnswer:
          'EXC_RETURN in LR: bit[2]=SPSEL (0=MSP, 1=PSP — which stack has exception frame). Wrong stack = wrong faulting PC in crash log. Bit[3]: FPU pushed or not, changes frame offset.',
      },
      {
        id: 'w9d2',
        day: 'Tue',
        topic: 'Whiteboard coding — implement from memory',
        reading: [
          'Practice: LDMA ping-pong descriptors, ISR, queue handoff (15 min)',
          'I2C bus recovery: 9 SCL pulses, STOP, re-init (15 min)',
          'CRC32 in C without lookup table (15 min)',
        ],
        question: 'Implement CRC32 in C without a lookup table.',
        referenceAnswer:
          'XOR byte into LSB of CRC, 8 iterations: if LSB=1 shift right XOR 0xEDB88320, else shift right. Init 0xFFFFFFFF, final ~crc. Bit-reversed polynomial, LSB-first processing.',
      },
      {
        id: 'w9d3',
        day: 'Wed',
        topic: 'STAR narratives — all 5 stories written + recorded',
        reading: [
          'STAR: Situation (1-2 sentences), Task (your responsibility), Action (say \'I\' not \'we\'), Result (quantified)',
          'Stories: EFR32 project, Lucid BMS patent, Workload reprioritization, Decision under uncertainty, Cross-functional collaboration',
        ],
        question: 'Tell me about a technical decision you made under uncertainty.',
        referenceAnswer:
          '[Template] Situation: specific context. Task: architecture decision with deadline. Action: enumerated options, ran experiment, chose based on measured data, documented. Result: quantified outcome.',
      },
      {
        id: 'w9d4',
        day: 'Thu',
        topic: 'Apple interview process + questions to ask',
        reading: [
          'Apple structure: recruiter screen, technical phone screen, on-site (4-6 rounds)',
          '2 technical, 1 system design, 1 project, 1-2 behavioral',
          'Project round is most important',
        ],
        question: 'Why do you want to work on AirPods firmware?',
        referenceAnswer:
          'Tightest integration of real-time audio DSP, ultra-low-power BLE, biometric sensing, custom silicon. Building EFR32BG13 transparency taught me how hard the constraints are. Want to affect daily audio experience of hundreds of millions.',
      },
      {
        id: 'w9d5',
        day: 'Fri',
        topic: 'Questions to ask Apple + application logistics',
        reading: [
          'Strong questions: \'How is audio DSP partitioned across H-series cores?\'',
          '\'Biggest challenge in spatial audio across head shapes?\'',
          '\'HIL regression testing approach?\'',
        ],
        question: 'What questions will you ask Apple interviewers?',
        referenceAnswer:
          'Technical: \'Hardest real-time constraint in audio pipeline?\' System design: \'How do you decompose new SoC bring-up?\' Project: \'Depth vs breadth in portfolio?\' Behavioral: \'Growth path for firmware engineers?\' Never repeat across rounds.',
      },
    ],
  },
  {
    week: 10,
    title: 'Cortex-M33 Concepts + Advanced ARM (Theory Only)',
    phase: 'Phase 3 — Interview Polish',
    questions: [
      {
        id: 'w10d1',
        day: 'Mon',
        topic: 'Cortex-M33 vs M4F — the delta',
        reading: [
          'M33 adds: TrustZone (SAU, Secure/Non-Secure, NSC regions, BLXNS)',
          'MPU 16 regions vs 8, AIRCR.BFHFNMINS',
          '95% of M4F knowledge transfers directly',
        ],
        question: 'You built on M4F. Apple uses custom silicon. How do you bridge the gap?',
        referenceAnswer:
          '\'My M4F knowledge transfers 95%. NVIC, SysTick, PendSV, DWT, faults — identical. M33 adds TrustZone (SAU partitioning) and 16-region MPU. I\'d ramp to specifics in the first week on the job.\'',
      },
      {
        id: 'w10d2',
        day: 'Tue',
        topic: 'TrustZone deep dive — Apple secure boot',
        reading: [
          'SAU: Secure/Non-Secure/NSC regions. NSC = veneer functions, only valid S→NS entry',
          'Apple Secure Enclave: separate die, handles keys + biometrics',
          'Apple boot chain: Boot ROM → LLB (ECDSA) → iBoot (ECDSA) → kernel',
        ],
        question: 'How does TrustZone differ from two separate processors for security?',
        referenceAnswer:
          'Separate processors: complete hardware isolation, highest security, higher cost. TrustZone: single die, lower cost, faster transitions, but security depends on correct SAU config. Apple chose separate Secure Enclave for highest threat model.',
      },
      {
        id: 'w10d3',
        day: 'Wed',
        topic: 'Advanced power: DVFS, retention & clock domain crossing',
        reading: [
          'DVFS: power ∝ C×V²×f. Halving V and f = 4× reduction',
          'Retention: SRAM banks at reduced voltage in deep sleep',
          'Clock domain crossing: synchronization FFs for metastability',
        ],
        question: 'What is DVFS and why is it important for wearable SoCs?',
        referenceAnswer:
          'Dynamic power = C×V²×f. Lower frequency allows lower voltage. Both changes: halving f and V = ¼ dynamic power. Firmware coordinates with PMIC, ~100µs transition time.',
      },
      {
        id: 'w10d4',
        day: 'Thu',
        topic: 'Multi-core firmware coordination',
        reading: [
          'Modern wearable SoCs: app processor + DSP core + BLE controller + sensor hub',
          'Inter-core: shared memory + mailbox interrupts + hardware semaphores',
        ],
        question: 'How do two cores share a ring buffer without cache coherency issues?',
        referenceAnswer:
          'Mark shared SRAM as non-cacheable in both MPUs. Or: producer cleans cache before signaling, consumer invalidates before reading. Hardware semaphores for atomic test-and-set across cores.',
      },
      {
        id: 'w10d5',
        day: 'Fri',
        topic: 'Week 10 self-assessment',
        reading: [
          'Self-test: 3 main TrustZone additions? Draw Apple boot chain. What is DVFS?',
          'Why no EM3 with BLE? EXC_RETURN bit[2]?',
        ],
        question: 'Apple asks: \'You built on older M4F. How quickly productive on our platform?\'',
        referenceAnswer:
          '\'Very quickly. DMA, RTOS, ISR patterns, power management — all transfer. Register maps and SDK differ, 2-4 weeks to productive. Harder ramp: inter-core coordination, but I\'ve studied this as a design exercise.\'',
      },
    ],
  },
  {
    week: 11,
    title: 'Mock Interviews — Full Rounds',
    phase: 'Phase 3 — Interview Polish',
    questions: [
      {
        id: 'w11d1',
        day: 'Mon',
        topic: 'Mock Round 1 — Technical deep dive',
        reading: [
          'Draw LDMA ping-pong (10 min), Debug frame drops (10 min)',
          'Tick hook vs idle hook (5 min), Add stereo — what changes? (10 min)',
          'DMA bus arbitration (10 min)',
        ],
        question: 'Tick hook vs idle hook?',
        referenceAnswer:
          'Tick hook: in SysTick ISR every 1ms, must be fast, no blocking APIs. Use: timestamp, debug GPIO. Idle hook: in Idle task when no tasks ready, task context. Use: EM2 sleep, background stats.',
      },
      {
        id: 'w11d2',
        day: 'Tue',
        topic: 'Mock Round 2 — System design whiteboard',
        reading: [
          'Design: TWS earbud with ANC, transparency, HR, BLE. Custom ARM SoC, 3 mics, HR sensor, 50mAh battery',
          'Cover all 8 dimensions in 40 minutes',
        ],
        question: 'How do you handle ANC latency (<0.5ms) vs FreeRTOS scheduling overhead?',
        referenceAnswer:
          'ANC runs in dedicated hardware DSP / bare-metal ISR, not FreeRTOS task. OS handles higher-level: coefficient update, BLE, mode changes. Any <1ms requirement = hardware or bare-metal.',
      },
      {
        id: 'w11d3',
        day: 'Wed',
        topic: 'Mock Round 3 — Project deep dive',
        reading: [
          'Present EFR32BG13 project: overview, ping-pong vs circular, queues vs shared memory',
          'Adaptive gain artifacts, hardest bug, limitations vs AirPods',
        ],
        question: 'Biggest limitation of your EFR32BG13 project vs production AirPods?',
        referenceAnswer:
          '1) Latency: 17ms vs <1ms (dedicated hardware). 2) Sample rate: 16kHz vs 48kHz. 3) No real ANC: heuristic wind detection, not FxLMS.',
      },
      {
        id: 'w11d4',
        day: 'Thu',
        topic: 'Mock Round 4 — Behavioral',
        reading: [
          'STAR stories: EFR32 project, Lucid patent, Workload reprioritization',
          'Decision under uncertainty, Cross-functional collaboration',
          'Check: \'I\' not \'we\'? Result quantified?',
        ],
        question: 'Tell me about a firmware decision with incomplete info and a hard deadline.',
        referenceAnswer:
          '[Template] Designed with defensive fallback + runtime logging. Shipped on time, fallback triggered in X% of edge cases, data led to hardware fix in next revision.',
      },
      {
        id: 'w11d5',
        day: 'Fri',
        topic: 'Full 90-min mock + gap list',
        reading: [
          'Phase 1 (15 min): phone screen intro',
          'Phase 2 (45 min): technical round',
          'Phase 3 (20 min): project round. Debrief: write 3 weakest answers',
        ],
        question: 'After 11 weeks, what is your biggest remaining gap?',
        referenceAnswer:
          'Common gaps: (1) Whiteboard anxiety — more timed paper coding. (2) System design completeness under pressure. (3) ANC architecture. (4) CFSR decoding cold. (5) Stories feeling rehearsed.',
      },
    ],
  },
  {
    week: 12,
    title: 'Final Polish + Application Submission',
    phase: 'Phase 3 — Interview Polish',
    questions: [
      {
        id: 'w12d1',
        day: 'Mon',
        topic: 'Targeted weak area review',
        reading: [
          'Take 3 weakest answers from mock debrief',
          'Re-read material, write answer from scratch, compare, identify gap, repeat until clean in <3 min cold',
        ],
        question: 'Walk the complete audio frame path: mic to speaker.',
        referenceAnswer:
          'Sound → MEMS mic → I2S → USART RX FIFO → LDMA → buffer → IRQ → xQueueSendFromISR → Mic Sampler → shift+sign-extend → Audio Processor → RMS+FFT+gain → TX DMA → MAX98357A → speaker. Parallel: BLE, NVM3, watchdog, EM2.',
      },
      {
        id: 'w12d2',
        day: 'Tue',
        topic: 'GitHub README + architecture diagram',
        reading: [
          'README: overview, hardware, build, demo, 3 design decisions',
          'Architecture PNG, measured results section',
          '\'Limitations vs Production\' section — this is your interview leave-behind',
        ],
        question: 'If you had 4 more weeks, what would you add?',
        referenceAnswer:
          'Options: (1) ECDSA dual-bank OTA with mbedTLS. (2) Stereo beamforming with second mic. (3) 5-band parametric EQ via BLE. Each shows depth + product thinking.',
      },
      {
        id: 'w12d3',
        day: 'Wed',
        topic: 'Resume + LinkedIn final update',
        reading: [
          'Resume: add EFR32BG13 project with 3 quantified bullets',
          'LinkedIn: same bullets + skills (FreeRTOS, LDMA, I2S, Cortex-M4F, CMSIS-DSP, BLE GATT, NVM3, EM2)',
        ],
        question: 'Explain your EFR32BG13 project to a non-firmware product manager.',
        referenceAnswer:
          '\'I built a working prototype of AirPods transparency mode. Mic captures sound, MCU processes in real-time, plays back through speaker in 18ms. Adaptive volume + wind detection + Bluetooth control. 8hr battery.\'',
      },
      {
        id: 'w12d4',
        day: 'Thu',
        topic: 'Application submission + referrals',
        reading: [
          'Submit: Apple Careers (firmware AirPods + wearables), cover letter with EFR32 project + Lucid BMS patent',
          'LinkedIn outreach to Apple firmware engineers',
          'Backups: Google Wearables, Bose, Qualcomm CSRA. Confirm H-1B timeline',
        ],
        question: '3 weeks since application, no response. What do you do?',
        referenceAnswer:
          'Normal (4-8 weeks). Continue backup applications. One LinkedIn follow-up with new project milestone. Check role status. Don\'t email recruiter more than once. Keep improving project.',
      },
      {
        id: 'w12d5',
        day: 'Fri',
        topic: '12 Weeks Complete — Final Cold Assessment',
        reading: [
          'Final cold test: Draw LDMA ping-pong. Decode CFSR=0x00008200. Context switch: HW vs SW registers',
          'Why no EM3 with BLE? M33 adds vs M4F? Full audio frame path in 90 sec',
          'If you answer all 6 cleanly — you are ready',
        ],
        question: 'What is your single biggest strength walking into Apple?',
        referenceAnswer:
          'You built something real on actual hardware, measured real numbers, hit real bugs, can speak to every layer. GitHub repo with working code + measured data + honest limitations. You\'ve debugged dropped frames at 3am. That\'s the difference.',
      },
    ],
  },
];

export default interviewPrepData;
