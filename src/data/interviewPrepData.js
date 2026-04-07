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
        readingNotes: [
          {
            source: 'ARM Cortex-M4F TRM §2.1–2.3 — Pipeline & Processor Features',
            content: `## The 3-Stage Pipeline

The Cortex-M4F uses a simple **3-stage in-order pipeline**: Fetch → Decode → Execute. While instruction N executes, instruction N+1 decodes and N+2 fetches — all simultaneously.

\`\`\`diagram
Cycle:    1    2    3    4    5    6
Instr A:  F    D    E
Instr B:       F    D    E
Instr C:            F    D    E
\`\`\`

**Why this matters for interviews:** No out-of-order execution means no speculative execution vulnerabilities (Spectre), but also no instruction-level parallelism beyond this pipeline. What you write is what runs, in order.

**Branch penalty:** When a branch is taken, the 2 instructions already in Fetch/Decode are wrong — they get flushed and pipeline refills (1–3 cycles penalty). This is why tight loops with many branches are slower than straight-line code.

## Key M4F Characteristics

- **No TrustZone** — M33 adds this. M4F has a single security domain
- **No data cache** — CPU and DMA always see the same SRAM. No cache coherency headaches (unlike Cortex-A)
- **Optional FPU** — single-precision (32-bit float). Must enable: \`SCB->CPACR |= (0xF << 20)\`
- **Thumb-2 ISA** — mix of 16-bit and 32-bit instructions, transparent to programmer
- **Two stack pointers:** MSP (Main Stack, used in Handler mode + privileged Thread) and PSP (Process Stack, used by FreeRTOS tasks in Thread mode)`,
          },
          {
            source: 'ARM Cortex-M4F TRM §B1.5 — NVIC & Exception Model',
            content: `## What Happens When an Interrupt Fires

Think of it as hardware doing a function call for you — but faster and more structured than any software call.

\`\`\`diagram
IRQ asserts
     │
     ▼
CPU finishes current instruction
     │
     ▼
Hardware pushes 8 registers onto active stack (MSP or PSP)
  Stack layout after push:
  ┌─────────┐ ← SP before interrupt
  │  xPSR   │ SP-4
  │   PC    │ SP-8   ← return address (next instruction)
  │   LR    │ SP-12
  │   r12   │ SP-16
  │   r3    │ SP-20
  │   r2    │ SP-24
  │   r1    │ SP-28
  │   r0    │ SP-32  ← new SP points here
  └─────────┘
     │
     ▼
NVIC fetches ISR address from vector table
     │
     ▼
ISR executes (12 cycles total from IRQ to first ISR instruction)
\`\`\`

## Latency: 12 Cycles

**12 cycles** is the baseline interrupt latency on M4F with no wait states and no FPU lazy stacking. At 38.4 MHz: 12/38,400,000 = **312 ns**.

With FPU lazy stacking (LSPEN=1): space is reserved for FP regs but not pushed yet. If the ISR uses FPU, they get pushed retroactively — adds up to 12 more cycles. Worst case: **24 cycles**.

## Tail-Chaining — The Key Optimization

**Problem:** When IRQ-B fires just as ISR-A finishes, naively you'd pop ISR-A's frame (12 cycles) then push IRQ-B's frame (12 cycles) = 24 wasted cycles just switching.

**Tail-chaining solution:** Hardware detects a pending IRQ during exception exit. Instead of popping + pushing, it stays in Handler mode and directly vectors to IRQ-B. **Saves ~6 cycles** by skipping the full pop+push.

\`\`\`diagram
Without tail-chaining:  ISR-A ──── pop ──── push ──── ISR-B
With tail-chaining:     ISR-A ──── vector ──── ISR-B
                                    (6 cycles saved)
\`\`\`

## Late-Arrival — Higher Priority Wins

If IRQ-B (higher priority) fires while the CPU is **in the middle of stacking** for IRQ-A, NVIC abandons IRQ-A's vector fetch and switches to IRQ-B's vector instead. The stacking work is shared — both use the same pushed frame. IRQ-A runs after IRQ-B completes (via tail-chain).

## Priority Numbers — Lower = Higher Priority

**Confusing but critical:** Priority 0 = highest urgency, priority 15 = lowest.

- EFR32BG13 implements **4 bits** = 16 priority levels (0–15)
- BLE radio stack runs at priority 0 — never masked
- \`configMAX_SYSCALL_INTERRUPT_PRIORITY\` = 16 (0x10 in 8-bit field): FreeRTOS masks everything at/below this via BASEPRI. ISRs above this (0–15) can still fire but **must not call FreeRTOS APIs**`,
          },
        ],
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
        readingNotes: [
          {
            source: 'EFR32BG13 USART0 UART + GPIO Interrupt Configuration',
            content: `## UART Setup — The Sequence That Always Works

\`\`\`c
// 1. Enable clock to USART0
CMU_ClockEnable(cmuClock_USART0, true);

// 2. Configure GPIO pins (PA0=TX, PA1=RX)
GPIO_PinModeSet(gpioPortA, 0, gpioModePushPull, 1); // TX
GPIO_PinModeSet(gpioPortA, 1, gpioModeInput, 0);    // RX

// 3. Initialize USART in async mode
USART_InitAsync_TypeDef init = USART_INITASYNC_DEFAULT;
init.baudrate = 115200;
USART_InitAsync(USART0, &init);

// 4. Route to GPIO pins
USART0->ROUTEPEN  = USART_ROUTEPEN_TXPEN | USART_ROUTEPEN_RXPEN;
USART0->ROUTELOC0 = USART_ROUTELOC0_TXLOC_LOC0 | USART_ROUTELOC0_RXLOC_LOC0;
\`\`\`

**Baud rate formula:** \`CLKDIV = 256 × (fHFPERCLK / baud − 1)\`
At 38.4 MHz, 115200 baud → CLKDIV ≈ 84,377. The SDK does this for you via \`USART_BaudrateAsyncSet()\`.

**GPIO interrupt setup:**
\`\`\`c
GPIO_ExtIntConfig(gpioPortD, 3, 3, true, false, true);
// port, pin, intNo, risingEdge, fallingEdge, enable
NVIC_EnableIRQ(GPIO_ODD_IRQn);

void GPIO_ODD_IRQHandler(void) {
  GPIO_IntClear(1 << 3);
  // set flag, post to queue — never call printf here
}
\`\`\``,
          },
          {
            source: 'ISR Rules — Why printf/malloc Are Forbidden',
            content: `## The Reentrancy Problem

A function is **reentrant** if it can be safely called from multiple contexts simultaneously. Most C standard library functions are NOT reentrant.

**printf():** Internally maintains a global \`FILE*\` stdout buffer + lock. If main() is halfway through a printf and an IRQ fires — and the ISR also calls printf — the shared buffer gets corrupted. Output becomes garbled or crashes.

**malloc():** Uses a single global heap with a lock (dlmalloc). Scenario:

\`\`\`diagram
Task context:   malloc() → acquires heap lock → interrupted mid-way
IRQ fires:      ISR calls malloc() → tries to acquire same lock → DEADLOCK
                CPU spins forever waiting for lock that will never release
\`\`\`

The system freezes. Watchdog eventually resets it. Very hard to debug because it only happens sometimes.

## The ISR Golden Rule

**Do the minimum. Return fast.**

\`\`\`c
// WRONG — never do this
void LDMA_IRQHandler(void) {
  LDMA_IntClear(LDMA_IEN_CH0DONE);
  process_audio_buffer();  // takes 2ms — blocks everything
  printf("frame done\\n");  // not reentrant!
}

// CORRECT
void LDMA_IRQHandler(void) {
  LDMA_IntClear(LDMA_IEN_CH0DONE);
  BaseType_t woken = pdFALSE;
  xQueueSendFromISR(audioQueue, &bufPtr, &woken);
  portYIELD_FROM_ISR(woken);  // switch to audio task immediately if it was waiting
}
\`\`\`

## FreeRTOS FromISR APIs

Every blocking FreeRTOS API has an ISR-safe version:

- \`xQueueSend()\` → \`xQueueSendFromISR()\`
- \`xSemaphoreGive()\` → \`xSemaphoreGiveFromISR()\`
- \`xTaskNotify()\` → \`xTaskNotifyFromISR()\`

The \`FromISR\` variants never block. They return \`pdTRUE\` in \`pxHigherPriorityTaskWoken\` if a higher-priority task was unblocked. Always call \`portYIELD_FROM_ISR(woken)\` at the end — this triggers a context switch before the ISR returns, so the unblocked task runs immediately.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'EFR32BG13 — CMU Clock Tree & Oscillators',
            content: `## The Clock Tree

\`\`\`diagram
  HFXO (38.4 MHz, ±20 ppm)  ──┐
  HFRCO (1–38 MHz, ±2.5%)   ──┼──► HFCLK ──► HFCORECLK ──► CPU (M4F)
  DPLL                       ──┘              HFPERCLK  ──► USART, TIMER, ADC

  LFXO (32.768 kHz, ±20 ppm) ──┐
  LFRCO (32 kHz, ±2%)         ──┼──► LFCLK ──► RTCC, LESENSE, LEUART
  ULFRCO (~1 kHz, ±2%)        ──┘             (runs in EM2/EM3)
\`\`\`

## HFXO vs HFRCO — The Core Tradeoff

| Property | HFXO | HFRCO |
|---|---|---|
| Frequency | 38.4 MHz fixed | 1–38 MHz selectable |
| Accuracy | **±20 ppm** | **±2.5%** (25,000 ppm) |
| Startup | ~1 ms | ~300 ns |
| Required for BLE | **Yes** | No |

**Why BLE needs HFXO:** BLE connection events must be timed to ±50 ppm total budget. HFRCO at ±2.5% = 25,000 ppm — 500× too inaccurate. The radio would miss every connection event.

**The clever design:** The BLE radio sequencer **automatically** switches HFRCO→HFXO before each radio event and back after. Firmware doesn't manage this. You just enable HFXO at startup and trust the hardware.

## Energy Modes Quick Reference

\`\`\`diagram
EM0 (Active):    CPU + all peripherals    ~5.5 mA
EM1 (Sleep):     CPU halted, DMA runs     ~1 mA
EM2 (Deep):      HFCLK off, LFXO runs    ~1.4 µA  ← BLE minimum
EM3 (Stop):      LFXO off, ULFRCO only   ~0.6 µA  ← BLE CANNOT use
EM4 (Hibernate): SRAM lost, GPIO wakeup  ~0.1 µA
\`\`\`

**Remember:** EM2 is the sweet spot for BLE wearables. LFXO (32.768 kHz) stays running to time connection events. The radio wakes from EM2 for each connection event, processes packets, then returns to EM2.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'ARM Cortex-M4F — Memory Map & MPU',
            content: `## The Fixed Memory Map

The M4F defines a fixed 4 GB address space. Every Cortex-M4 chip uses the same layout — only the sizes differ.

\`\`\`diagram
0xFFFFFFFF ┌────────────────────────────┐
           │  Vendor-specific (0.5 GB)  │
0xE0100000 ├────────────────────────────┤
0xE0000000 │  PPB — Private Periph Bus  │ ← NVIC, SysTick, DWT, ITM, MPU
0xDFFFFFFF ├────────────────────────────┤
0xA0000000 │  External Device (1 GB)    │
0x9FFFFFFF ├────────────────────────────┤
0x60000000 │  External RAM (1 GB)       │
0x5FFFFFFF ├────────────────────────────┤
0x40000000 │  Peripheral (512 MB)       │ ← EFR32BG13 peripherals 0x4000xxxx
0x3FFFFFFF ├────────────────────────────┤
0x20000000 │  SRAM (512 MB)             │ ← EFR32BG13: 64 KB at 0x20000000
0x1FFFFFFF ├────────────────────────────┤
0x00000000 │  Code (512 MB)             │ ← Flash: 0x00000000 (512 KB on BG13)
           └────────────────────────────┘
\`\`\`

**PPB (Private Peripheral Bus) at 0xE0000000:** This is where all debug and system control registers live. You access NVIC, SysTick, DWT cycle counter, ITM trace ports, and MPU through this region. It's always accessible regardless of MPU config.

## MPU — 8 Programmable Regions

The MPU lets you override the default access rules for up to 8 address regions. Each region has:

- **Base address** (must be naturally aligned to region size)
- **Size** (2^(SIZE+1) bytes, minimum 32 bytes)
- **Access permissions** (AP field)
- **XN bit** — eXecute Never: any attempt to execute code from this region → MemManage fault

\`\`\`c
// Configure region 0: task stack as XN + read/write
MPU->RNR  = 0;                          // select region 0
MPU->RBAR = 0x20000000;                 // base address
MPU->RASR = (0b011 << 24)              // AP = full R/W
           | (1 << 28)                  // XN = execute never
           | (17 << 1)                  // SIZE = 17 → 2^18 = 256 KB
           | (1 << 0);                  // ENABLE
MPU->CTRL = MPU_CTRL_ENABLE_Msk | MPU_CTRL_PRIVDEFENA_Msk;
\`\`\`

**MPU register addresses (memorize these):**
- \`MPU_TYPE\` = 0xE000ED90 → DREGION field tells you how many regions (8 on M4F)
- \`MPU_CTRL\` = 0xE000ED94 → bit[0]=ENABLE, bit[2]=PRIVDEFENA
- \`MPU_RNR\`  = 0xE000ED98 → write 0–7 to select region
- \`MPU_RBAR\` = 0xE000ED9C → base address + VALID + REGION
- \`MPU_RASR\` = 0xE000EDA0 → size + permissions + XN

**AP field values:**
- \`000\` = no access (fault on any access)
- \`001\` = privileged R/W only
- \`011\` = full R/W (privileged + unprivileged)
- \`111\` = read-only

**FreeRTOS MPU port:** Wraps each task's stack in a dedicated MPU region (XN + privileged-only). Stack overflow → MemManage fault with exact address in MMFAR. Much better than the sentinel pattern alone.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'GNU LD Linker Scripts — LMA, VMA & Boot Sequence',
            content: `## The Core Concept: Two Addresses Per Section

Every section in your firmware has two addresses:

- **LMA (Load Memory Address):** Where it lives in the binary file / flash. The programmer writes bytes here.
- **VMA (Virtual Memory Address):** Where the CPU accesses it at runtime.

For most sections these are the same. For \`.data\` they are deliberately different.

\`\`\`diagram
Flash (LMA):                        SRAM (VMA):
┌─────────────┐ 0x00000000          ┌─────────────┐ 0x20000000
│  .text      │ (code, XIP)         │  .data      │ ← copied from flash at boot
│             │                     │             │
│  .rodata    │                     │  .bss       │ ← zeroed at boot
│  .data(LMA) │ ← stored here       │             │
└─────────────┘                     │  heap/stack │
                                    └─────────────┘
\`\`\`

## Linker Script Structure

\`\`\`c
MEMORY {
  FLASH (rx)  : ORIGIN = 0x00000000, LENGTH = 512K
  RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 64K
}

SECTIONS {
  .text : { *(.text*) } > FLASH        /* VMA = LMA = flash */

  .data : AT > FLASH {                 /* LMA = flash (AT>) */
    __data_start__ = .;
    *(.data*)
    __data_end__ = .;
  } > RAM                              /* VMA = SRAM */

  __data_load__ = LOADADDR(.data);     /* linker symbol = LMA */

  .bss : {
    __bss_start__ = .;
    *(.bss*)
    __bss_end__ = .;
  } > RAM                              /* no LMA — not in binary */
}
\`\`\`

## The Boot Copy Loop — What Reset_Handler Must Do

\`\`\`c
void Reset_Handler(void) {
  // 1. Copy .data from flash (LMA) to SRAM (VMA)
  uint32_t *src = &__data_load__;
  uint32_t *dst = &__data_start__;
  while (dst < &__data_end__) *dst++ = *src++;

  // 2. Zero .bss in SRAM
  dst = &__bss_start__;
  while (dst < &__bss_end__) *dst++ = 0;

  // 3. Init system (clocks, etc.)
  SystemInit();

  // 4. Call main
  main();
}
\`\`\`

**Without step 1:** \`.data\` variables (e.g., \`int x = 42;\`) read from uninitialized SRAM → garbage. Bug appears randomly depending on power-on SRAM state. Extremely hard to debug.

**Without step 2:** \`.bss\` variables (e.g., \`static int count;\`) have random values instead of 0. Another class of subtle startup bugs.

**Why .text doesn't need copying:** M4F executes code directly from flash (XIP — execute-in-place). Flash reads are routed directly to the instruction bus.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'EFR32BG13 Flash — NOR Cells, Timing & Wear',
            content: `## How a Flash Cell Works

A NOR flash cell is a floating-gate transistor. The gate is electrically isolated — charge can be injected or removed, but stays there when power is off.

\`\`\`diagram
          Control Gate
               │
         ──────┴──────
        │  Floating   │  ← charge stored here (isolated)
        │    Gate     │
         ──────┬──────
               │
    Source ────┴──── Drain

Bit = 1: no charge → low threshold → transistor ON at normal Vgs
Bit = 0: charge trapped → high threshold → transistor OFF at normal Vgs
\`\`\`

**Program (write):** Apply high voltage to inject electrons onto floating gate. Forces bit 1→0. **Cannot go 0→1 this way.**

**Erase:** Apply opposite high voltage to remove electrons. Forces all bits in a page back to 1. **Entire page erased at once** — you cannot erase a single byte.

## EFR32BG13 Flash Numbers (Memorize These)

- **Page size:** 2 KB
- **Page erase time:** 20–40 ms, **typ 29.5 ms** ← this blocks your audio path!
- **Word write time:** 20–30 µs, **typ 26.3 µs**
- **Endurance:** minimum **10,000 erase cycles** per page
- **Total flash:** 512 KB = 256 pages

## Firmware Design Rules That Follow From This

**Rule 1 — Never write flash in ISR or audio task.** A page erase takes 29.5 ms. At 16 kHz with 256-sample frames, one frame = 16 ms. Erasing blocks for nearly 2 full frames → catastrophic audio dropout.

**Rule 2 — Wear leveling is not optional.** 10,000 erase cycles sounds like a lot. If you store BLE config and it updates every connection (every 500 ms): 10,000 / (24×3600×2) = 0.06 days until that page dies. NVM3 spreads writes across many pages.

**Rule 3 — Use NVM3 for all NVM writes.** Never write directly to flash from application code. NVM3 handles wear leveling, page management, and compaction. Run \`nvm3_repack()\` only from a low-priority task.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'FreeRTOS — FreeRTOSConfig.h & Heap Allocators',
            content: `## Critical FreeRTOSConfig.h Settings

\`\`\`c
// FreeRTOSConfig.h — settings that matter most for EFR32BG13

#define configTOTAL_HEAP_SIZE       ( 32 * 1024 )  // 32 KB of 64 KB SRAM
#define configTICK_RATE_HZ          1000            // 1 ms tick resolution
#define configMAX_PRIORITIES        8               // 8 priority levels (0=lowest)
#define configMINIMAL_STACK_SIZE    128             // idle task: 128 words = 512 bytes
#define configUSE_PREEMPTION        1               // preemptive (tasks yield automatically)
#define configUSE_MUTEXES           1               // enables priority inheritance
#define configUSE_RECURSIVE_MUTEXES 1
#define configCHECK_FOR_STACK_OVERFLOW  2           // mode 2: sentinel pattern
#define configUSE_STATS_FORMATTING_FUNCTIONS 1
#define configGENERATE_RUN_TIME_STATS   1           // for vTaskGetRunTimeStats()

// Critical: FreeRTOS masks IRQs at/below this priority
// Set to 5 (0x50 in 8-bit field) — BLE radio at 0 stays unmasked
#define configMAX_SYSCALL_INTERRUPT_PRIORITY  ( 5 << (8 - configPRIO_BITS) )
\`\`\`

## SRAM Budget on EFR32BG13 (64 KB total)

\`\`\`diagram
64 KB SRAM:
  .data / .bss          ~4 KB
  FreeRTOS heap         32 KB
    ├── MicSampler stack   2 KB
    ├── AudioProc stack    4 KB  (FFT needs more)
    ├── BLEManager stack   2 KB
    ├── NVM3Manager stack  1 KB
    ├── WatchdogPetter     512 B
    ├── Idle task stack    512 B
    ├── Queue buffers      2 KB
    └── TCBs (~500B each)  3 KB
  DMA buffers (static)   4 KB   ← allocated outside heap!
  Margin                ~24 KB
\`\`\`

**Key rule:** DMA buffers must be **statically allocated** (not from heap). They need fixed addresses for the LDMA descriptor chain.

## Heap Allocators — Which to Use

| Scheme | Free? | Coalescing | Use when |
|---|---|---|---|
| heap_1 | No | N/A | Ultra-simple, never free anything |
| heap_2 | Yes | No | Fixed-size allocations (no fragmentation) |
| heap_3 | Yes | N/A | Wraps newlib malloc — thread-safe wrapper |
| **heap_4** | Yes | **Yes** | **EFR32BG13 recommended** — handles fragmentation |
| heap_5 | Yes | Yes | Multiple non-contiguous SRAM regions |

**heap_4 is the right choice** for EFR32BG13: it merges adjacent free blocks (coalescing), preventing fragmentation over long runtimes. Audio buffers are pre-allocated at startup, so heap activity is low and fragmentation stays minimal.

**When heap is exhausted:** \`pvPortMalloc()\` returns NULL. \`xTaskCreate()\` returns \`errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY\`. Always:
\`\`\`c
configASSERT( xTaskCreate(myTask, "name", 512, NULL, 3, NULL) == pdPASS );
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'FreeRTOS Internals — Scheduler, SysTick & PendSV',
            content: `## Why SysTick + PendSV Instead of Just SysTick?

The problem with doing the context switch directly in SysTick:

SysTick runs at high priority (typically priority 15 — near highest). If the context switch (saving/restoring ~17 registers) happened inside SysTick, it would block all lower-priority IRQs for the entire switch duration. That could be 100–200 cycles of blocked interrupts every millisecond.

**The elegant solution — two-step:**

\`\`\`diagram
SysTick IRQ (high priority):
  1. xTaskIncrementTick()       ← move delayed tasks to ready list
  2. Is higher-priority task ready? → set PENDSVSET bit in SCB->ICSR
  3. Return from SysTick ISR    ← fast, minimal blocking

↓ (all other pending IRQs run here)

PendSV IRQ (LOWEST priority = 0xFF):
  1. Only fires when NO other IRQ is pending
  2. Saves current task's r4-r11 + PSP onto task stack
  3. Loads new task's PSP
  4. Restores new task's r4-r11
  5. Returns via EXC_RETURN → hardware restores r0-r3,r12,LR,PC,xPSR
\`\`\`

**Why hardware saves r0-r3/r12/LR/PC/xPSR automatically:** These are "caller-saved" registers — the CPU saves them on any exception entry. PendSV only needs to save the "callee-saved" registers (r4–r11) manually. This is why the context switch is just 8 push + 8 pop instructions.

## Data Structures Inside FreeRTOS

\`\`\`diagram
pxReadyTasksLists[8]:   (one circular list per priority)
  [7] → TCB_AudioProc → TCB_BLEMgr → (back to start)
  [3] → TCB_NVM3Mgr
  [1] → TCB_Watchdog
  [0] → TCB_Idle

xDelayedTaskList:       (sorted by wake tick, head = next to wake)
  TCB_SomeTask (wake at tick 1234) → TCB_Other (wake at 1500) → ...
\`\`\`

Each **TCB (Task Control Block)** stores: PSP value, stack high-water mark, task name, priority, state, notification values.

## The Tick → Schedule Cycle

\`\`\`diagram
SysTick every 1ms:
  tickCount++
  Check delayed list head: if wake_tick <= tickCount → move to ready list
  If moved task has higher priority than current → set PENDSVSET

PendSV fires (after SysTick exits):
  xPortPendSVHandler:
    PUSH {r4-r11}         ; save callee-saved on current task stack
    STR  SP, [TCB+0]      ; save PSP into current TCB
    LDR  TCB, [pxCurrentTCB] ; get next TCB from scheduler
    LDR  SP, [TCB+0]      ; restore PSP from new TCB
    POP  {r4-r11}         ; restore callee-saved for new task
    BX   LR               ; EXC_RETURN → hardware restores rest
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'FreeRTOS — Queues, Mutexes & Priority Inversion',
            content: `## Queues — Copy by Value, Not Pointer

FreeRTOS queues copy data **by value**. When you send a pointer, the pointer value is copied (4 bytes) — not the data it points to. This is why audio ping-pong passes a buffer *pointer* through the queue: the buffer stays in its DMA region, only the address is transferred.

\`\`\`c
// Creating a queue of 4 buffer-pointer slots
QueueHandle_t audioQueue = xQueueCreate(4, sizeof(int32_t *));

// In ISR: send pointer to filled buffer
int32_t *buf = &rx_bufA[0];
xQueueSendFromISR(audioQueue, &buf, &woken);

// In task: receive pointer
int32_t *buf;
xQueueReceive(audioQueue, &buf, portMAX_DELAY);  // blocks until data
process(buf);
\`\`\`

## Priority Inversion — The Mars Pathfinder Bug

In 1997, the Mars Pathfinder rover kept resetting. Root cause: **priority inversion**.

\`\`\`diagram
Three tasks:
  H = Bus Manager (high priority)   — needs mutex to access shared bus
  M = Communications (medium)       — CPU-intensive, no mutex needed
  L = Meteorological (low)          — holds mutex, running slowly

Timeline:
  t=0:  L acquires mutex
  t=1:  H wakes, tries to acquire mutex → BLOCKS (mutex held by L)
  t=2:  M wakes (no mutex needed) → PREEMPTS L (M > L priority)
  t=3:  M runs continuously... L never runs... H waits forever
  t=∞:  Watchdog fires, system resets
\`\`\`

**The inversion:** H is effectively running at L's priority because L holds a resource H needs, and M blocks L from running.

## Priority Inheritance — The Fix

With \`configUSE_MUTEXES=1\`, FreeRTOS mutexes implement **priority inheritance**:

\`\`\`diagram
  H blocks on mutex held by L
       ↓
  FreeRTOS boosts L's priority to H's priority temporarily
       ↓
  L now preempts M (L runs at H's priority)
       ↓
  L releases mutex → L's priority drops back to normal
       ↓
  H acquires mutex and runs
\`\`\`

**Binary semaphore vs Mutex:**
- \`xSemaphoreCreateBinary()\` — signaling only, no ownership tracking, **no priority inheritance**
- \`xSemaphoreCreateMutex()\` — has owner, enables priority inheritance. Use for shared resources.

**Deadlock prevention rule:** Always acquire multiple mutexes in the same global order. If TaskA takes mutex1 then mutex2, TaskB must also take mutex1 then mutex2. Never reverse the order.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'FreeRTOS — Stack Overflow Detection Modes',
            content: `## Two Modes, One Goal

Stack grows downward on ARM. Overflow = stack pointer goes below the allocated region, writing into adjacent memory (another task's stack, heap, or global data). Silent corruption is the worst kind of bug.

\`\`\`diagram
Stack memory (grows downward):
  ┌────────────────────┐ ← stack top (allocated at xTaskCreate)
  │   free space       │
  │                    │
  │   local variables  │ ← SP somewhere here during normal execution
  │   saved registers  │
  │─ ─ ─ ─ ─ ─ ─ ─ ─ ─│
  │ 0xA5 0xA5 0xA5 0xA5│ ← Mode 2 sentinel (last 20 bytes)
  │ 0xA5 0xA5 ...      │
  └────────────────────┘ ← stack bottom
  [adjacent memory — corruption if overflow]
\`\`\`

## Mode 1: PSP Check

At each context switch, checks if the task's stack pointer (PSP) is still within the allocated region.

**Advantage:** Zero runtime overhead between context switches.
**Limitation:** Only catches overflows that are still active at switch time. If the overflow happened and the function returned (SP recovered), Mode 1 misses it entirely.

## Mode 2: Sentinel Pattern

At task creation, fills the **entire** stack with \`0xA5A5A5A5\`. At every context switch, checks if the **last 20 bytes** still contain \`0xA5\`.

\`\`\`c
// What FreeRTOS does at xTaskCreate():
memset(stackBase, 0xA5, stackSize * sizeof(StackType_t));

// What it checks at each context switch:
for (i = 0; i < 20; i++) {
    if (pxTCB->pxStack[i] != (StackType_t)0xa5a5a5a5) {
        vApplicationStackOverflowHook(pxTCB, pxTCB->pcTaskName);
    }
}
\`\`\`

**Advantage:** Catches overflows that happened and recovered — the sentinel bytes are permanently corrupted even after SP returns.

**What Mode 2 can miss:**
- Overflow that doesn't reach the last 20 bytes (task has large stack, overflow is small)
- Overflow between two context switches that is then corrected before the next switch AND doesn't reach the sentinel

## Sizing Stacks With High-Water Mark

\`\`\`c
// During development — run full test scenario, then check:
UBaseType_t watermark = uxTaskGetStackHighWaterMark(audioTaskHandle);
// Returns minimum free words ever recorded
// If watermark = 10 words (40 bytes) — dangerously close to overflow!
// Target: watermark > 20% of total stack size
\`\`\`

**Rule of thumb:** Add 25% margin to your measured worst-case. Worst case includes: deepest function call chain + all active ISR nesting + FPU lazy stacking (68 bytes).

\`\`\`c
void vApplicationStackOverflowHook(TaskHandle_t xTask, char *pcTaskName) {
  // DO NOT return from this function
  __disable_irq();
  // Log task name to retention SRAM (survives reset)
  memcpy(retentionSRAM, pcTaskName, 16);
  NVIC_SystemReset();
}
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'EFR32BG13 LDMA — Linked Descriptors & Ping-Pong',
            content: `## What Makes LDMA Different From Basic DMA

Basic DMA: program source, destination, count → fires once → done. CPU must reprogram for next transfer.

**LDMA (Linked DMA):** Each descriptor points to the next descriptor. Hardware automatically chains transfers without CPU involvement. Critical for audio: the gap between frames must be zero — any CPU latency would cause samples to be missed.

## Descriptor Structure

\`\`\`c
typedef struct {
  uint32_t  CTRL;    // transfer count, data size, link offset
  uint32_t  SRC;     // source address (or peripheral register)
  uint32_t  DST;     // destination address
  uint32_t  LINK;    // address of next descriptor (or 0 to stop)
} LDMA_Descriptor_t;
\`\`\`

**CTRL field key bits:**
- \`STRUCTTYPE\` = TRANSFER (0), SYNC (1), WRITE (2)
- \`XFERCNT\` = count-1 (transfers 1–2048 units)
- \`SIZE\` = unit size: BYTE(0), HALFWORD(1), WORD(2)
- \`DONEIEN\` = 1 → generate IRQ when this descriptor completes
- \`LINKMODE\` + \`LINK\` = address of next descriptor

## Ping-Pong Setup — The Actual Code

\`\`\`c
static int32_t rx_bufA[256];
static int32_t rx_bufB[256];

// Two descriptors that link to each other
LDMA_Descriptor_t desc[2];

// DescA: fills bufA, then jumps to DescB
desc[0] = (LDMA_Descriptor_t)LDMA_DESCRIPTOR_LINKREL_P2M_WORD(
    &USART1->RXDATA,  // source: USART1 RX data register
    rx_bufA,          // destination: bufA
    256,              // count: 256 words
    1                 // link offset: +1 descriptor = desc[1]
);
desc[0].xfer.doneIfs = 1;   // generate IRQ on completion

// DescB: fills bufB, then jumps back to DescA
desc[1] = (LDMA_Descriptor_t)LDMA_DESCRIPTOR_LINKREL_P2M_WORD(
    &USART1->RXDATA,
    rx_bufB,
    256,
    -1              // link offset: -1 descriptor = desc[0]
);
desc[1].xfer.doneIfs = 1;

// Channel config: triggered by USART1 RX data available
LDMA_TransferCfg_t cfg = LDMA_TRANSFER_CFG_PERIPHERAL(
    ldmaPeripheralSignal_USART1_RXDATAV
);

// Start — LDMA runs forever autonomously from here
LDMA_StartTransfer(0, &cfg, &desc[0]);
\`\`\`

## What Happens at Runtime

\`\`\`diagram
LDMA autonomously:          CPU (via ISR):
desc[0] runs →              (busy with other tasks)
  fills bufA word by word
  256 words done →
  IRQ fires ──────────────► LDMA_IRQHandler():
                               post &rx_bufA to queue
                               (MicSampler task unblocks)
desc[1] starts immediately ◄ (LDMA already moved on, zero gap)
  fills bufB word by word
  256 words done →
  IRQ fires ──────────────► LDMA_IRQHandler():
                               post &rx_bufB to queue
desc[0] starts again...
\`\`\`

**Zero gap between buffers** — this is the key advantage. By the time the ISR runs (12 cycles), LDMA has already started filling the next buffer.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Ping-Pong DMA vs Interrupt-Driven — The Numbers',
            content: `## The Math That Makes Ping-Pong Essential

**Interrupt-driven approach (per-sample):**
- I2S at 16 kHz stereo = 32,000 samples/sec
- Each IRQ: ~40 cycles (12 entry + 16 ISR body + 12 exit)
- CPU overhead: 32,000 × 40 = **1.28M cycles/sec = 3.3% CPU**
- Plus: 32,000 context switch opportunities per second destroys FreeRTOS scheduling

**Ping-pong DMA (256 samples/block):**
- IRQ rate: 32,000 / 256 = **125 IRQs/sec**
- Frame period: 256/16000 = **16 ms of uninterrupted CPU time**
- CPU overhead: < 0.01%

\`\`\`diagram
Interrupt-driven timeline (16 ms window):
IRQ IRQ IRQ IRQ IRQ IRQ IRQ IRQ ... (512 interrupts in 16 ms!)
│││││││││││││││││││││││││││││││││
Tasks never get more than ~31 µs of contiguous execution

Ping-pong DMA timeline (16 ms window):
IRQ─────────────── 16 ms free ───────────────IRQ
 └─post to queue    (DSP, BLE, NVM3 all run here)
\`\`\`

## Ping-Pong vs Circular DMA

**Circular DMA (single buffer):** DMA continuously writes into one buffer, wrapping around. CPU must consume data faster than DMA produces it. If CPU is late → DMA overwrites unconsumed data. **Silently loses data with no notification.**

**Ping-pong (two buffers):**
- While DMA fills bufB → CPU safely processes bufA (no race condition)
- DMA completion IRQ hands off the pointer
- Even if CPU takes slightly longer than one frame, bufA is protected until the next handoff

\`\`\`diagram
Circular:   [─────buffer─────]  (DMA writes, CPU must keep up)
                                 ← DMA overwrites if CPU is slow

Ping-pong:  [───bufA───][───bufB───]
             ↑CPU reads  ↑DMA writes  (completely separated)
\`\`\`

## Detecting Frame Drops

\`\`\`c
static volatile uint32_t missed_frames = 0;

void LDMA_IRQHandler(void) {
  LDMA_IntClear(LDMA_IEN_CH0DONE);
  int32_t *buf = (active_desc == 0) ? rx_bufA : rx_bufB;
  BaseType_t woken = pdFALSE;

  if (xQueueSendFromISR(audioQueue, &buf, &woken) != pdTRUE) {
    missed_frames++;  // queue full = AudioProcessor can't keep up
  }
  portYIELD_FROM_ISR(woken);
}
\`\`\`

Read \`missed_frames\` via BLE characteristic or ITM port. Any non-zero value in steady state = system overloaded.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'FPU Lazy Stacking — FPCCR & Deterministic Latency',
            content: `## The Problem: FPU Adds 68 Bytes to Exception Frame

The M4F FPU has 16 extra registers: S0–S15 plus FPSCR. If saved on every exception: 17 words × 4 bytes = **68 extra bytes** pushed to the stack on every IRQ entry. At 12 MHz with wait states, that's significant latency.

**But:** Most ISRs don't use the FPU. Why waste time saving FP state they'll never touch?

## Lazy Stacking — The Compromise

**LSPEN bit** in FPCCR (0xE000EF34) enables lazy stacking (default = 1, enabled).

\`\`\`diagram
IRQ fires:
  Hardware: reserve 68 bytes on stack (just decrement SP)
            but DON'T write S0-S15 yet
            → total interrupt latency still 12 cycles

ISR runs:
  Case A: ISR never touches FPU
    → reserved space wasted but never accessed
    → fast exit, latency = 12 cycles ✓

  Case B: ISR executes first FPU instruction
    → hardware NOW fills the 68 reserved bytes (retroactive push)
    → adds ~12 cycles at that point
    → worst case latency = 24 cycles
\`\`\`

**FPCAR** (0xE000EF38) holds the address of the reserved space, so hardware knows where to fill it when the FPU instruction triggers the lazy push.

## When to Disable Lazy Stacking

If your ISR **always** uses the FPU (e.g., LDMA audio processing ISR that starts DSP immediately), lazy stacking gives no benefit but adds non-determinism (sometimes 12 cycles, sometimes 24).

\`\`\`c
// Disable lazy stacking — consistent 24-cycle latency (always saves FP state)
FPU->FPCCR &= ~FPU_FPCCR_LSPEN_Msk;  // LSPEN = bit 30

// Enable lazy stacking (default)
FPU->FPCCR |= FPU_FPCCR_LSPEN_Msk;
\`\`\`

## DWT Cycle Counter — Measuring Latency

\`\`\`c
// Enable DWT counter (do once at startup)
CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
DWT->CYCCNT = 0;
DWT->CTRL   |= DWT_CTRL_CYCCNTENA_Msk;

// Measure any code block
uint32_t t0 = DWT->CYCCNT;
arm_rfft_fast_f32(&fftInstance, input, output, 0);
uint32_t cycles = DWT->CYCCNT - t0;
// At 38.4 MHz: us = cycles / 38.4
\`\`\`

**DWT_CYCCNT at 0xE0001004** — memorize this address. It's a free, always-on profiler with single-cycle resolution. No printf needed.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'I2S Protocol & SPH0645 Mic Data Format',
            content: `## I2S Signals and Timing

I2S uses three wires: **BCLK** (bit clock), **LRCK/WS** (left-right clock / word select), and **DATA**.

\`\`\`diagram
BCLK:  ─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─┐┌─
         └┘ └┘ └┘ └┘ └┘ └┘ └┘ └┘ └┘ └┘ └┘ └┘

LRCK:  ────────────────┐                ┌──────
                        └────────────────┘
                    LEFT channel        RIGHT channel

DATA:   [MSB─────────────────────LSB][MSB──────...]
         bit31                  bit0   bit31
         ↑ changes on falling BCLK edge
         ↑ sampled on rising BCLK edge (standard I2S)
\`\`\`

**LRCK = LOW → Left channel.** LRCK = HIGH → Right channel.

## BCLK Calculation

\`\`\`
BCLK = sample_rate × channels × bits_per_frame
     = 16,000 × 2 × 32
     = 1,024,000 Hz = 1.024 MHz
\`\`\`

LRCK = sample_rate = 16,000 Hz (one complete L+R pair per period)

## SPH0645 Data Format — The Tricky Part

The SPH0645 is an 18-bit mic but outputs in a 32-bit I2S frame. The data is **left-justified**:

\`\`\`diagram
32-bit I2S word from SPH0645:
  bit: 31 30 29 28 ... 15 14 | 13 12 11 ... 1 0
       [─── 18-bit audio ───] | [── zero padding ──]
        MSB             LSB
\`\`\`

**Extraction:**
\`\`\`c
uint32_t raw = /* 32-bit word from LDMA buffer */;

// Shift right 14 to get 18-bit value in bits[17:0]
int32_t sample = (int32_t)(raw >> 14);

// Sign-extend from bit 17 (18-bit two's complement → 32-bit)
if (sample & (1 << 17)) {
    sample |= ~((1 << 18) - 1);  // fill upper 14 bits with 1s
}
// Now 'sample' is a proper signed 32-bit value
\`\`\`

**Why >> 14?** The 18 bits occupy positions [31:14] of the 32-bit word. Shifting right 14 moves them to [17:0].

## EFR32BG13 USART1 I2S — The Erratum

USART1 on EFR32BG13 has a documented erratum: certain CLKDIV values cause LRCK to glitch, producing misaligned frames. The fix is a specific CLKDIV value from Silicon Labs Application Note. Symptoms: every Nth sample has wrong L/R assignment, audio sounds distorted with a periodic artifact. Visible on logic analyzer as LRCK pulse-width deviation.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Debugging Frame Drops — Systematic Approach',
            content: `## The Debug Ladder: Start With Data, Then Narrow

Never guess. Add instrumentation first, then diagnose.

## Step 1 — Quantify the Problem

\`\`\`c
volatile uint32_t missed_frames = 0;
volatile uint32_t total_frames = 0;

void LDMA_IRQHandler(void) {
  LDMA_IntClear(LDMA_IEN_CH0DONE);
  total_frames++;
  int32_t *buf = active_buf;

  BaseType_t woken = pdFALSE;
  if (xQueueSendFromISR(audioQueue, &buf, &woken) != pdTRUE) {
    missed_frames++;  // queue full = consumer can't keep up
  }
  portYIELD_FROM_ISR(woken);
}
\`\`\`

If \`missed_frames\` stays at 0 — the frame drop is somewhere else (output side, BLE, NVM3). If non-zero — AudioProcessor is too slow.

## Step 2 — Find the Bottleneck

\`\`\`diagram
Possible causes for AudioProcessor being slow:

NVM3 repack() ──────► blocks for 29.5ms (almost 2 frames!)
                       Fix: move nvm3_repack() to NVM3Manager task

BLE mutex hold ─────► AudioProcessor waiting for AudioConfig mutex
                       Fix: minimize mutex hold time, use atomic flags

FFT too slow ───────► arm_rfft_fast_f32(512) > 16ms budget
                       Fix: reduce to FFT-128, run every 4th frame

Heap fragmentation ─► pvPortMalloc() slow due to fragmented free list
                       Fix: pre-allocate all audio buffers at init
\`\`\`

## Step 3 — GPIO Trace (Best Tool You Have)

\`\`\`c
// In LDMA_IRQHandler:
GPIO_PinOutToggle(gpioPortA, 5);  // PA5: IRQ pulse

// In AudioProcessor task:
GPIO_PinOutSet(gpioPortA, 6);     // PA6 high = task active
// ... processing ...
GPIO_PinOutClear(gpioPortA, 6);   // PA6 low = task idle
\`\`\`

4-channel logic analyzer shows exactly:
- **Is there a growing gap** between IRQ and task execution? → scheduling issue
- **Does PA6 stay high for > 16ms?** → processing too slow
- **Does PA6 go low then PA6 stays low for long?** → task blocked (mutex? queue?)

## Step 4 — vTaskGetRunTimeStats

\`\`\`c
char statsBuffer[512];
vTaskGetRunTimeStats(statsBuffer);
// Outputs something like:
// Task          AbsTime   %Time
// AudioProc     24560123   78%   ← consuming almost all CPU
// BLEManager    3451234    11%
// Idle          1234567     4%   ← healthy if > 10%, problem if near 0%
\`\`\`

**Healthy system:** Idle task gets ≥ 10% of CPU → system has headroom. If Idle ≈ 0% → system is overloaded, frame drops are expected.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'MAX98357A I2S Amplifier — Operation & Silence Handling',
            content: `## What MAX98357A Needs to Work

The MAX98357A is a **Class D amplifier with built-in I2S DAC**. It has no internal buffer — it converts each incoming I2S sample to PWM output in real time. This makes it simple but sensitive to clock interruptions.

**Requirements:**
- BCLK must be continuous (cannot stop and restart)
- LRCK must be continuous and stable
- Both clocks must be present before SD_MODE goes HIGH

## What Happens If BCLK Stops

\`\`\`diagram
Normal operation:
  BCLK running → DAC tracking → speaker at audio signal

BCLK stops mid-playback:
  DAC loses I2S sync → output stage floats
  Output capacitors charge to VDD/2 (mid-supply)
  BCLK resumes → output suddenly snaps from VDD/2 to signal
  Result: LOUD POP / CLICK — can damage hearing and speaker
\`\`\`

## Correct Way to Handle Silence

**Wrong:** Stop BCLK when nothing to play.
**Correct:** Keep BCLK/LRCK running. Fill TX DMA buffer with zeros.

\`\`\`c
// Silence = all-zero TX buffer, still running
memset(tx_buf, 0, sizeof(tx_buf));
// LDMA keeps transmitting zeros → speaker silent, no pop
\`\`\`

## Shutdown Sequence

\`\`\`diagram
1. Ramp gain to 0 over ~10 frames (avoid abrupt click)
2. Pull SD_MODE LOW → amp begins 200ms soft shutdown
3. Wait 200ms (MAX98357A internally ramps output to 0V)
4. Now safe to stop BCLK (amp is fully quiet)
\`\`\`

## TX Ping-Pong (Mirror of RX)

AudioProcessor writes processed samples into the **inactive** TX buffer. On TX DMA completion IRQ, swap active/inactive. The LDMA transmits from the active buffer while AudioProcessor prepares the next frame — same zero-gap principle as RX.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Transparency Latency Budget — Where the Time Goes',
            content: `## Breaking Down the 17ms

\`\`\`diagram
Sound hits mic
  │
  ▼ BCLK clock cycles (1.024 MHz)
  │
LDMA fills 256-sample buffer ──────────────── 16.0 ms  ← DOMINANT
  (CPU cannot start until buffer is full)
  │
  ▼
FreeRTOS queue handoff + task scheduling ───── 0.5 ms
  │
  ▼
DSP: RMS + FFT-256 + gain apply ─────────────  1.0 ms  (at 38.4 MHz)
  │
  ▼
TX DMA start + MAX98357A output ─────────────  0.5 ms
  │
  ▼
Sound from speaker                    TOTAL: ~18 ms
\`\`\`

## The Tradeoff: Block Size vs Latency

| Block size | Latency | IRQ rate | DSP time/frame |
|---|---|---|---|
| 256 samples | 16 ms | 62.5 Hz | 15 ms available |
| 128 samples | 8 ms | 125 Hz | 7 ms available |
| 64 samples | 4 ms | 250 Hz | 3 ms available |
| 32 samples | 2 ms | 500 Hz | 1 ms available — barely enough |

**Smaller blocks = less latency BUT less time per frame for DSP.** FFT-256 takes ~1 ms, so with 32-sample blocks you'd have to skip FFT entirely.

## Why AirPods Achieves <1ms

AirPods Pro uses a dedicated always-on DSP die. No RTOS scheduling, no queue handoff, no DMA block waiting. The DSP processes each sample individually in a fixed-latency pipeline, like an analog circuit implemented in digital hardware. **Not achievable on a general-purpose MCU with an RTOS.**

## Psychoacoustic Thresholds

- **< 10 ms:** Imperceptible — sounds like natural hearing
- **10–30 ms:** Slightly perceptible — sounds "slightly processed"
- **> 30 ms:** Disturbing — Lombard effect triggers, you unconsciously raise your voice`,
          },
        ],
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
        readingNotes: [
          {
            source: 'CMSIS-DSP & Adaptive Gain Control',
            content: `## CMSIS-DSP on M4F — Why It's Fast

CMSIS-DSP is ARM's hand-optimized DSP library. On M4F it uses **FMAC instructions** (Fused Multiply-Accumulate) that complete in a single cycle. Without CMSIS-DSP, a naive C loop for 256 samples might take 10× longer.

**Compile flag required:** \`-mfpu=fpv4-sp-d16 -mfloat-abi=hard\`
Without \`-mfloat-abi=hard\`, the compiler calls soft-float library functions instead of FPU instructions — 50–100× slower.

## Key Functions

\`\`\`c
// RMS of 256 samples → single float result
float32_t rms;
arm_rms_f32(buffer, 256, &rms);

// Real FFT: 256 real inputs → 128 complex output bins
arm_rfft_fast_instance_f32 fftInst;
arm_rfft_fast_init_f32(&fftInst, 256);  // do once at init
arm_rfft_fast_f32(&fftInst, input, output, 0);
// output[2k], output[2k+1] = Re, Im of bin k
// Bin k frequency: k × (16000 / 256) = k × 62.5 Hz

// Scale (apply gain)
arm_scale_f32(buffer, gain_factor, out_buffer, 256);
\`\`\`

## Adaptive Gain Control — The Logic

\`\`\`diagram
Each 16ms frame:
  1. Compute RMS of input buffer → current_rms
  2. target_gain = target_rms / current_rms
  3. Slew-limit: don't jump immediately
       if (target_gain < current_gain)
           current_gain -= min(0.12, current_gain - target_gain)  // attack: -1dB/frame
       else
           current_gain += min(0.06, target_gain - current_gain)  // release: +0.5dB/frame
  4. Apply: arm_scale_f32(buffer, current_gain, output, 256)
\`\`\`

**Why asymmetric attack/release?**
- **Fast attack** (reduce gain quickly): protects hearing from sudden loud sounds
- **Slow release** (increase gain slowly): prevents "pumping" — the audible "whoosh" when gain jumps up between words in speech

**Why slew at all?** A gain change of even 0.5 dB within a single 16ms frame creates a discontinuity in the waveform amplitude → audible click. Slew spreading the change over 8+ frames makes it inaudible (< 1 dB/frame threshold).

## AudioConfig Mutex Pattern

\`\`\`c
// BLE task writes config (infrequent)
xSemaphoreTake(audioConfigMutex, portMAX_DELAY);
audioConfig.targetLevel = newLevel;
xSemaphoreGive(audioConfigMutex);

// AudioProcessor reads config (every frame)
xSemaphoreTake(audioConfigMutex, 0);  // non-blocking! skip if busy
float target = audioConfig.targetLevel;
xSemaphoreGive(audioConfigMutex);
\`\`\`

**Never use volatile alone for multi-field structs.** volatile prevents compiler reordering but not CPU reordering on multi-core, and doesn't guarantee atomic multi-field reads.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'FFT Wind Detection — Spectral Analysis',
            content: `## Why Spectral Analysis for Wind?

Wind and speech have fundamentally different spectral signatures:

\`\`\`diagram
Speech spectrum:
  Power │  ████
        │  ████ ██
        │  ████ ████ ██
        │  ████ ████ ████ ██  ░░
        └─────────────────────────→ freq
           0   1   2   3   4   7 kHz
  Dominant energy in low frequencies (fundamentals 80-300 Hz + harmonics)

Wind noise spectrum:
  Power │  ██ ██ ██ ██ ██ ██ ██ ██
        │  ██ ██ ██ ██ ██ ██ ██ ██
        │  ██ ██ ██ ██ ██ ██ ██ ██
        └─────────────────────────→ freq
           0   1   2   3   4   7 kHz
  Relatively flat broadband noise (turbulence has no dominant frequency)
\`\`\`

**Energy ratio** = high-freq energy / total energy:
- Speech: ratio ≈ 0.10–0.20 (most energy at low freq)
- Wind: ratio ≈ 0.40–0.60 (energy spread across spectrum)

## Implementation

\`\`\`c
#define FFT_SIZE    256
#define FS          16000
#define BIN_FREQ    (FS / FFT_SIZE)   // 62.5 Hz per bin
#define LO_BINS_END 20                // 0–1250 Hz = speech
#define HI_BINS_START 80              // 5000–8000 Hz = wind

float32_t fft_out[FFT_SIZE];
float32_t mag[FFT_SIZE/2];

// Forward FFT
arm_rfft_fast_f32(&fftInst, pcm_buffer, fft_out, 0);

// Magnitudes
arm_cmplx_mag_f32(fft_out, mag, FFT_SIZE/2);

// Sum energies
float lo_energy = 0, total_energy = 0;
arm_power_f32(mag, FFT_SIZE/2, &total_energy);
arm_power_f32(mag, LO_BINS_END, &lo_energy);

float hi_energy = total_energy - lo_energy;
float ratio = hi_energy / (total_energy + 0.001f);  // avoid div/0

// Hysteresis: require 3 consecutive detections
static int wind_count = 0;
if (ratio > 0.35f) wind_count = MIN(wind_count + 1, 3);
else               wind_count = MAX(wind_count - 1, 0);
bool wind_detected = (wind_count >= 3);
\`\`\`

## Why Hysteresis?

Without hysteresis: ratio fluctuates around threshold → wind_detected toggles rapidly every frame → gain changes every 16ms → audible chattering artifact.

With hysteresis (require 3 consecutive): wind must persist for 48ms before detection, and must go away for 48ms before clearing. Stable detection with no rapid switching.

## Run Every 4th Frame

Wind changes at ~1–5 Hz timescale. FFT every 4 frames = 15.6 Hz update rate = completely sufficient. Saves ~1ms DSP time per frame on average.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'NVM3 Wear Leveling + BLE GATT Hierarchy',
            content: `## Why Flash Needs Wear Leveling

Flash pages have a 10,000 erase cycle limit. Without wear leveling, if you always write to the same page:

\`\`\`
10,000 writes to the same key → same page erased 10,000 times → page dies
\`\`\`

With NVM3 spreading writes across 10 pages:
\`\`\`
10,000 writes / 10 pages = 1,000 erases per page
Remaining capacity: 9,000 more cycles on each page
Total effective writes: 10,000 × 10 = 100,000
\`\`\`

## How NVM3 Works Internally

NVM3 uses a **circular log** (append-only) across N flash pages:

\`\`\`diagram
Flash pages reserved for NVM3:
  Page 0: [key=0x100, val=1] [key=0x200, val=42] [INVALID 0x100] [key=0x100, val=2]
  Page 1: [key=0x300, val=7] [key=0x100, val=3] [key=0x200, val=43] ...
  Page 2: [currently being written] ...

Log wraps around → old pages get repacked (compacted) when full
\`\`\`

**Repack (compaction):** Scan all pages → copy only live (latest) records to a new page → erase old pages. Time: ~29.5ms per page erase × N pages. **This is the only blocking operation.**

\`\`\`c
// WRONG — called from AudioProcessor task (blocks audio for 150ms!)
void AudioProcessor_Task(void) {
  process_audio(buf);
  nvm3_writeData(h, KEY_STATS, &stats, sizeof(stats));  // triggers repack!
}

// CORRECT — repack in dedicated low-priority task
void NVM3Manager_Task(void) {
  while (1) {
    if (nvm3_repackNeeded(h)) nvm3_repack(h);  // ~150ms, OK at low priority
    vTaskDelay(pdMS_TO_TICKS(1000));
  }
}
\`\`\`

## BLE GATT Hierarchy (Quick Reference)

\`\`\`diagram
Profile
  └── Service (UUID e.g. 0x180D = Heart Rate)
        └── Characteristic (UUID + value + properties)
              ├── Value (the actual data bytes)
              ├── CCCD (0x2902) ← client writes 0x0001 to enable notifications
              └── User Description (optional)
\`\`\`

**CCCD write = subscription.** Without the client writing 0x0001 to CCCD, the server is forbidden from sending notifications even if you call \`send_notification()\`. Always debug this first when notifications aren't arriving.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'EFR32BG13 Energy Modes — Current Values & BLE Constraints',
            content: `## Energy Mode Summary (Memorize These Numbers)

\`\`\`diagram
Mode   Clocks available        CPU    Current   Wakeup
EM0    HFXO/HFRCO + LFXO      Run    ~5.5 mA   N/A (already running)
EM1    HFXO/HFRCO + LFXO      Halt   ~1 mA     Any interrupt (~µs)
EM2    LFXO/LFRCO only         Off    ~1.4 µA   RTCC, GPIO (~5µs)
EM3    ULFRCO only (±2%)        Off    ~0.6 µA   GPIO, ACMP (~5µs)
EM4    None (GPIO wakeup only)  Off    ~0.1 µA   GPIO only (~ms, SRAM lost)
\`\`\`

**EM2 is the BLE sweet spot.** LFXO (32.768 kHz, ±20 ppm) stays running → radio can time connection events. CPU off, DMA off, HFCLK gated. Radio wakes, does its thing, CPU resumes, radio returns to EM2.

## Why EM3 Breaks BLE — The Timing Math

BLE connection events must arrive on time. The spec allows ±50 ppm total timing error between master and slave.

\`\`\`
LFXO accuracy:  ±20 ppm
ULFRCO accuracy: ±2% = ±20,000 ppm

At CI = 100 ms:
  With LFXO:   100ms × 20ppm   =   2 µs timing error → radio window easily covers this ✓
  With ULFRCO: 100ms × 20000ppm = 2 ms timing error → radio window missed → link drops ✗
\`\`\`

ULFRCO is **400× too inaccurate** for BLE. EM3 cannot be used with active BLE connections.

## Entering EM2 From FreeRTOS

\`\`\`c
// In vApplicationIdleHook() — called when no tasks are ready
void vApplicationIdleHook(void) {
  // All tasks blocked → safe to sleep
  EMU_EnterEM2(true);  // true = restore oscillators on wakeup
  // CPU wakes here on next RTCC event or IRQ
}
\`\`\`

The \`true\` parameter is important — it restores the clock sources (HFXO, etc.) to their pre-sleep state automatically. Without it, firmware would need to manually re-enable clocks after wakeup.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Clock Gating vs Power Gating — CMOS Power Model',
            content: `## Two Ways to Save Power in CMOS

**Dynamic power** dominates when circuits are switching:
\`P_dynamic = C × V² × f × α\`
(C = capacitance, V = supply voltage, f = clock frequency, α = activity factor = fraction of gates switching per cycle)

**Clock gating** sets α = 0 → zero dynamic power. The circuit still has power, registers retain state, but no switching happens.

**Leakage power** = transistors leaking even when idle: \`P_leak = V × I_leakage\`
Clock gating does NOT eliminate leakage. The transistors are still powered.

\`\`\`diagram
Clock gating:
  Clock ──►[AND gate]──► peripheral
              ↑
           enable bit (CMU_ClockEnable)

  Disabled: clock gated off → no switching → P_dynamic = 0
  State: ALL registers preserved → instant re-enable, no config needed

Power gating:
  VDD ──►[power switch FET]──► entire power domain
              ↑
           sleep enable

  Off: VDD disconnected → P_leak = 0 → P_total ≈ 0
  State: ALL registers LOST → must save to retention SRAM before gating
\`\`\`

## EFR32BG13 Uses Clock Gating, Not Power Gating

You control it with:
\`\`\`c
CMU_ClockEnable(cmuClock_USART0, false);  // gate USART0 clock, state retained
// ... later ...
CMU_ClockEnable(cmuClock_USART0, true);   // instantly re-enabled, config intact
\`\`\`

In EM2, the CMU automatically gates the HFCLK domain. LFXO-clocked peripherals (RTCC, LESENSE) keep running.

## Average Current Calculation

\`\`\`
Frame: 16 ms active at 5.5 mA → 88 µAs
Sleep: CI(500ms) - 16ms = 484 ms at 1.4 µA → 0.68 µAs
Average = (88 + 0.68) / 500 = 177 µA
\`\`\`

Energy Profiler in Simplicity Studio measures this directly via AEM (Advanced Energy Monitor) on the devkit. Resolution ~100 nA — good enough to see 1.4 µA EM2 current.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Bootloader — CRC Verification, Anti-Rollback & Dual-Bank OTA',
            content: `## Flash Layout

\`\`\`diagram
0x00000000 ┌─────────────────┐
           │   Bootloader    │  16 KB — runs on every reset
0x00004000 ├─────────────────┤
           │   Application   │  ~480 KB — jumped to by bootloader
           │                 │
           │                 │
0x0007C000 ├─────────────────┤
           │   NVM3 pages    │  last N pages for NVM3 storage
0x00080000 └─────────────────┘
\`\`\`

## Image Header + CRC Verification

\`\`\`c
typedef struct {
  uint32_t magic;       // 0xDEADBEEF — quick sanity check
  uint32_t version;     // image version number
  uint32_t length;      // app length in bytes (excl. header)
  uint32_t crc32;       // CRC32 of header(excl. crc field) + app binary
  uint8_t  hw_variant;  // hardware revision this image targets
} ImageHeader_t;
\`\`\`

**Bootloader flow:**
\`\`\`c
ImageHeader_t *hdr = (ImageHeader_t *)0x00004000;
if (hdr->magic != 0xDEADBEEF) goto fail;
if (hdr->version < minimum_version) goto fail;  // anti-rollback
uint32_t computed = crc32((uint8_t*)hdr, sizeof(ImageHeader_t) - 4);
computed = crc32_continue(computed, (uint8_t*)0x00004010, hdr->length);
if (computed != hdr->crc32) goto fail;
jump_to_app(0x00004000);  // success
\`\`\`

## Jumping to Application

\`\`\`c
void jump_to_app(uint32_t app_base) {
  uint32_t *vtor = (uint32_t *)app_base;
  uint32_t msp   = vtor[0];  // initial stack pointer
  uint32_t reset = vtor[1];  // reset handler address

  __disable_irq();
  // Reset all peripherals to avoid bootloader state leaking into app
  SysTick->CTRL = 0;
  __set_MSP(msp);
  ((void(*)(void))reset)();  // never returns
}
\`\`\`

## Anti-Rollback

Minimum version stored in a **write-once** flash page (OTP-like). Each bit starts as 1; writing 0 is permanent. Version 3 = 3 bits set to 0 = \`0xFFFFFFF8\`. Can only increase.

After deploying a security fix: update minimum_version → field devices running old vulnerable firmware will be rejected on next OTA update.

## Why Dual-Bank Is Power-Fail Safe

\`\`\`diagram
Single-bank OTA:           Dual-bank OTA:
  Erase active flash         Write to inactive bank B
  Write new image            (bank A keeps running)
  [power fails here]         [power fails: bank A still intact]
  ► BRICKED — no valid image ► Safe — bank A boots normally
                               Next boot: verify B → swap if OK
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'ARM Cortex-M4F Fault Registers — Complete Decoding Guide',
            content: `## The Fault Register Map (Memorize Addresses)

\`\`\`diagram
0xE000ED28  CFSR  Configurable Fault Status Register (32-bit)
             bits[7:0]   = MMFSR  (MemManage faults)
             bits[15:8]  = BFSR   (Bus faults)
             bits[31:16] = UFSR   (Usage faults)

0xE000ED2C  HFSR  HardFault Status Register
0xE000ED34  MMFAR MemManage Fault Address Register  (valid when MMARVALID=1)
0xE000ED38  BFAR  BusFault Address Register          (valid when BFARVALID=1)
\`\`\`

## CFSR Bit Reference

**MMFSR (bits 7:0) — MemManage (MPU violations):**
\`\`\`
[7] MMARVALID   MMFAR holds valid fault address
[4] MSTKERR     Fault on exception entry stacking
[3] MUNSTKERR   Fault on exception exit unstacking
[1] DACCVIOL    Data access violation (MPU rule)
[0] IACCVIOL    Instruction fetch violation (XN region)
\`\`\`

**BFSR (bits 15:8) — BusFault (bus errors):**
\`\`\`
[15] BFARVALID   BFAR holds valid fault address
[12] STKERR      Fault on exception stacking
[11] UNSTKERR    Fault on exception unstacking
[10] IMPRECISERR Imprecise fault (write buffer — BFAR may be invalid!)
[9]  PRECISERR   Precise fault (BFAR is exact faulting address)
[8]  IBUSERR     Instruction bus error
\`\`\`

**UFSR (bits 31:16) — UsageFault:**
\`\`\`
[25] DIVBYZERO   Integer divide by zero (if enabled)
[24] UNALIGNED   Unaligned access (if enabled)
[19] NOCP        FPU instruction, FPU not enabled → fix: SCB->CPACR |= 0xF<<20
[18] INVPC       Invalid EXC_RETURN
[17] INVSTATE    EPSR.T=0 (ARM mode, not Thumb)
[16] UNDEFINSTR  Undefined instruction
\`\`\`

## Worked Example: CFSR=0x00008200

\`\`\`
0x00008200 in binary:
  bits[31:16] = 0x0000  → UFSR = 0 (no usage fault)
  bits[15:8]  = 0x82    → BFSR = 0b10000010
  bits[7:0]   = 0x00    → MMFSR = 0 (no MPU fault)

BFSR = 0b10000010:
  bit[15]=1 → BFARVALID ✓ (BFAR holds valid address)
  bit[9]=1  → PRECISERR ✓ (precise bus fault, BFAR is exact)

BFAR = 0x40010000 → USART0 base address on EFR32BG13
Cause: Accessed USART0 register without enabling its clock (CMU_ClockEnable)
\`\`\`

## Reading the Faulting PC

\`\`\`c
void HardFault_Handler(void) {
  // Determine which stack was active
  uint32_t *frame;
  __asm volatile (
    "TST LR, #4        \n"   // LR bit[2]: 0=MSP, 1=PSP
    "ITE EQ            \n"
    "MRSEQ %0, MSP     \n"
    "MRSNE %0, PSP     \n"
    : "=r" (frame)
  );

  uint32_t pc = frame[6];   // PC at time of fault
  // arm-none-eabi-objdump -d firmware.elf | grep -A5 "<pc_hex>"
  while(1);  // or reset
}
\`\`\`

**HFSR FORCED bit:** Set when a configurable fault (MemManage/BusFault/UsageFault) escalated to HardFault — either because the handler is disabled or the fault happened inside an exception handler. Always check CFSR first when FORCED is set.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Multi-Task Watchdog Pattern — EFR32BG13 WDOG',
            content: `## Why a Simple Watchdog Isn't Enough

A basic watchdog pets the dog in one place — if that one place keeps running, the dog gets fed even if 3 other tasks are deadlocked. The multi-task pattern requires **every** task to check in.

## The Bitmask Pattern

\`\`\`c
// One bit per monitored task
#define BIT_MIC_SAMPLER   (1u << 0)
#define BIT_AUDIO_PROC    (1u << 1)
#define BIT_BLE_MANAGER   (1u << 2)
#define ALL_TASK_BITS     (BIT_MIC_SAMPLER | BIT_AUDIO_PROC | BIT_BLE_MANAGER)

volatile uint32_t xWatchdogBits = 0;

// Each task calls this periodically (e.g., every iteration)
void WatchdogCheckIn(uint32_t taskBit) {
  xWatchdogBits |= taskBit;  // atomic on Cortex-M (single STR instruction)
}

// WatchdogPetter task — LOWEST priority
void WatchdogPetter_Task(void *arg) {
  while (1) {
    if (xWatchdogBits == ALL_TASK_BITS) {
      WDOG_Feed();            // pet the hardware watchdog
      xWatchdogBits = 0;      // clear all bits for next round
    }
    // If any bit is missing: WatchdogPetter simply doesn't feed
    // → hardware WDOG expires → system reset
    vTaskDelay(pdMS_TO_TICKS(WDOG_TIMEOUT_MS / 2));
  }
}
\`\`\`

## Why Lowest Priority Is Crucial

\`\`\`diagram
High priority tasks:   MicSampler, AudioProc, BLEManager
                       ↓ each sets their bit, then block on queue/delay

Low priority:          WatchdogPetter runs ONLY when all above are idle
                       (if any high-priority task runs forever → petter starves → no feed → reset)

Idle (lowest):         EMU_EnterEM2() — sleeps when truly nothing to do
\`\`\`

If a high-priority task gets stuck in an infinite loop, it never yields → WatchdogPetter never runs → dog never fed → reset. **This is the intended behavior.**

## Post-Mortem: Reading Reset Cause

\`\`\`c
// At boot, before clearing:
uint32_t rstCause = EMU->RSTCAUSE;

if (rstCause & EMU_RSTCAUSE_WDOGRST) {
  // Watchdog reset! Log to NVM3 for analysis
  nvm3_writeData(h, KEY_RESET_CAUSE, &rstCause, 4);
}
EMU_RSTCAUSE_CLR();  // clear flags (register clears on read on some variants)
\`\`\`

**EFR32BG13 WDOG runs in EM2/EM3** — counts ticks even while sleeping. This ensures the system truly wakes up and processes within the timeout window.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'BLE Connection Parameters — CI, Slave Latency & Power',
            content: `## The Three Connection Parameters

**Connection Interval (CI):** How often master and slave rendezvous for a connection event. Range: 7.5 ms – 4000 ms in 1.25 ms steps.

**Slave Latency (SL):** Peripheral may skip up to SL consecutive events without listening. Saves power without changing CI. Range: 0–499.

**Supervision Timeout (ST):** If no successful exchange for ST duration, connection drops. Constraint: **ST > (SL + 1) × CI × 2**

## Worst-Case Latency Formula

If the central sends a command, the peripheral may be asleep for up to SL events before it wakes:

\`\`\`
Worst-case response latency = (SL + 1) × CI

Example: CI=500ms, SL=3
  Peripheral may skip 3 events → wakes on 4th
  Worst case = 4 × 500ms = 2000ms = 2 seconds ✓ (meets <2s requirement)
\`\`\`

## Power Model

\`\`\`
Avg radio current ≈ peak_rx_current × (event_duration / CI) × (1 / (SL+1))

At CI=500ms, SL=3, event=2ms, peak=5mA:
  = 5mA × (2ms / 500ms) × (1/4)
  = 5mA × 0.004 × 0.25
  = 5 µA average radio current
\`\`\`

**SL=3 reduces radio duty by 75%** compared to SL=0 at the same CI.

## Choosing Parameters — The Decision Matrix

\`\`\`diagram
Need fast response (< 100ms):     CI = 50-100ms, SL = 0
  ► high power, low latency

Need low power, tolerate 2s:      CI = 500ms, SL = 3
  ► 4× less radio duty, 2s worst case

Streaming data constantly:        CI = 20-50ms, SL = 0
  ► throughput matters more than power
\`\`\`

**MTU negotiation:** Default ATT_MTU = 23 bytes → max payload = 20 bytes per notification. Negotiate up to 247 bytes for \`LE 1M\` PHY. Always negotiate at connection setup for audio level streaming.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'BLE GATT Notifications & Security',
            content: `## GATT Hierarchy — The Mental Model

Think of GATT as a structured database on the peripheral:

\`\`\`diagram
GATT Server (peripheral = EFR32BG13)
  └── Service: Audio (UUID 0x1234...)
        ├── Characteristic: Audio Level (NOTIFY property)
        │     ├── Value: [current dB level, 2 bytes]
        │     └── CCCD (0x2902): [0x0000 = off, 0x0001 = notify enabled]
        └── Characteristic: Mode Config (WRITE property)
              └── Value: [transparency/ANC/off mode, 1 byte]
\`\`\`

## CCCD — The Notification Switch

**CCCD write is mandatory.** The BLE spec forbids sending notifications unless the client has written 0x0001 to that characteristic's CCCD. The server has no way to push data — it only responds to the client's subscription.

\`\`\`
nRF Connect debug flow:
  1. Connect to device
  2. Find "Audio Level" characteristic
  3. Manually write 0x01 0x00 to CCCD descriptor
  4. Notifications should now appear
  → If yes: CCCD was the issue in your app
  → If no: problem is in firmware stack
\`\`\`

**CCCD state is per-connection.** When device reconnects without bonding, CCCD resets to 0. With bonding, LTK + CCCD state are stored in NVM3 and restored on reconnect.

## Notification Checklist When Nothing Arrives

\`\`\`
1. CCCD written 0x0001? (nRF Connect to verify)
2. Connection handle current? (save from CONNECTION_OPENED event)
3. Characteristic declared with NOTIFY property in GATT XML?
4. Payload ≤ (MTU - 3) bytes?
5. Return code from send_notification checked?
   SL_STATUS_NO_MORE_RESOURCE → TX buffer full, retry later
6. SL + CI timing — peripheral might be sleeping, max latency = (SL+1)×CI
\`\`\`

## Pairing vs Bonding

- **Pairing:** One-time key exchange for encrypted link (session only)
- **Bonding:** Stores LTK in NVM → auto-encrypt on reconnect without repeating pairing
- **Just Works:** No passkey, no MITM protection. Fine for audio level data, not for OTA commands
- **Passkey entry:** 6-digit PIN, MITM protected. Use for OTA firmware writes`,
          },
        ],
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
        readingNotes: [
          {
            source: 'I2C & SPI Protocol Fundamentals',
            content: `## I2C: Open-Drain "Wired-AND" Bus

The key insight: I2C is a **wired-AND** bus. Any device can pull a line LOW, but no device can drive it HIGH — they can only release it (let the pull-up resistor do the work). This enables multi-master, multi-slave on just 2 wires with no arbitration hardware.

\`\`\`diagram
         Pull-up (4.7kΩ typical)     Pull-up
              │                         │
VDD ──────────┼─────────────────────────┼───
              │                         │
             SCL                       SDA
              │                         │
  ┌───────────┴───┐               ┌─────┴──────┐
  │  EFR32BG13   │               │  Sensor    │
  │  I2C Master  ├───────────────┤  Slave     │
  └───────────────┘               └────────────┘

Open-drain rule: device drives 0V (low) or releases (high via pull-up).
NEVER drives VDD directly. Any stuck-low device blocks everyone.
\`\`\`

## I2C Transaction Structure

\`\`\`diagram
START  [7-bit addr][R/W] ACK  [8-bit data] ACK  STOP
  │         │       │    │        │         │     │
SDA:▔╲__[A6..A0][R/W][_][D7..D0][_]╱▔▔
SCL:▔▔▔ ╲─7 clocks─╱▔╲─8 clocks─╱▔▔

START:  SDA falls while SCL HIGH  (unique — only valid here)
STOP:   SDA rises while SCL HIGH  (unique — only valid here)
ACK:    slave pulls SDA LOW on 9th clock
NACK:   SDA released HIGH → error or end of transfer
\`\`\`

**Why ACK/NACK matters:** Writing to a non-existent address → NACK on address byte. Your driver MUST check this and return an error — not silently send data into the void.

## Speeds

| Mode | Clock | Typical Use |
|------|-------|-------------|
| Standard | 100 kHz | EEPROMs, slow sensors |
| Fast | 400 kHz | IMUs, display drivers |
| Fast+ | 1 MHz | High-bandwidth sensors |
| High-speed | 3.4 MHz | Memories, cameras |

**Clock stretching:** Slave holds SCL low to stall the master when not ready. Not all masters support it — check your peripheral. EFR32BG13 I2C: supports stretching by default.

## Bus Lockup: Root Cause and 9-Pulse Recovery

**Why it happens:** Master resets mid-byte (power glitch, watchdog). Slave is mid-transmission, holding SDA LOW waiting for more SCL pulses. Re-initializing the I2C peripheral does nothing — it won't start while SDA is stuck low.

\`\`\`c
void i2c_bus_recovery(void) {
    // 1. Take SCL/SDA away from the I2C peripheral
    GPIO_PinModeSet(SCL_PORT, SCL_PIN, gpioModePushPull, 1);
    GPIO_PinModeSet(SDA_PORT, SDA_PIN, gpioModeInput, 0);

    // 2. Toggle SCL up to 9 times — clock out the stuck byte
    for (int i = 0; i < 9; i++) {
        GPIO_PinOutClear(SCL_PORT, SCL_PIN);
        delay_us(5);            // ~100kHz half-period
        GPIO_PinOutSet(SCL_PORT, SCL_PIN);
        delay_us(5);
        if (GPIO_PinInGet(SDA_PORT, SDA_PIN)) break;  // slave released
    }

    // 3. Generate STOP condition (SDA↑ while SCL HIGH)
    GPIO_PinModeSet(SDA_PORT, SDA_PIN, gpioModePushPull, 0);
    delay_us(5);
    GPIO_PinOutSet(SCL_PORT, SCL_PIN);
    delay_us(5);
    GPIO_PinOutSet(SDA_PORT, SDA_PIN);  // SDA rises = STOP

    // 4. Re-init peripheral normally
    I2C_Init(I2C0, &i2c_init_config);
}
\`\`\`

## SPI: Full-Duplex Push-Pull

\`\`\`diagram
Master (EFR32BG13)              Slave (MAX98357A config)
┌─────────────────┐             ┌─────────────────┐
│  USART (SPI)    │             │                 │
│  MOSI ──────────┼─────────────┼── SDI           │
│  MISO ──────────┼─────────────┼── SDO           │
│  SCLK ──────────┼─────────────┼── SCLK          │
│  CS   ──────────┼─────────────┼── CS (active ↓) │
└─────────────────┘             └─────────────────┘

SPI is PUSH-PULL (not open-drain). Fast. CS is asserted before
first SCLK edge and deasserted after last. Multiple slaves: one
CS pin per slave.
\`\`\`

## SPI CPOL/CPHA Modes — The 4 Combinations

\`\`\`diagram
Mode 0 (CPOL=0, CPHA=0): idle LOW, sample on RISING edge
  SCLK: ___╱▔╲___╱▔╲___╱▔╲___
  MOSI: ──[D7]──[D6]──[D5]──
               ↑    ↑    ↑
           sample (rising edge)

Mode 3 (CPOL=1, CPHA=1): idle HIGH, sample on RISING edge
  SCLK: ▔▔╲___╱▔▔╲___╱▔▔╲___▔
  MOSI: ──[D7]──[D6]──[D5]──
               ↑    ↑    ↑
\`\`\`

| Mode | CPOL | CPHA | Idle | Sample on |
|------|------|------|------|-----------|
| 0 | 0 | 0 | LOW | Rising |
| 1 | 0 | 1 | LOW | Falling |
| 2 | 1 | 0 | HIGH | Falling |
| 3 | 1 | 1 | HIGH | Rising |

**Memory trick:** CPOL = idle level. CPHA=0 → sample on FIRST edge. CPHA=1 → sample on SECOND edge. Wrong mode = corrupted data with no error indication.

\`\`\`c
// EFR32BG13 USART in SPI master mode:
USART_InitSync_TypeDef spi_init = USART_INITSYNC_DEFAULT;
spi_init.baudrate = 1000000;    // 1 MHz
spi_init.clockMode = usartClockMode0;  // CPOL=0, CPHA=0
spi_init.msbf = true;           // MSB first
USART_InitSync(USART0, &spi_init);
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'OTA Firmware Update Architecture — Dual-Bank, CRC vs ECDSA',
            content: `## Why Single-Bank OTA Gets Devices Bricked

\`\`\`diagram
Single-bank OTA — danger zone:

Flash: [======= ACTIVE APP v1.1 =======]
            │
            Erase active flash (3.84s for 128 pages × 30ms)
            │
Flash: [                EMPTY                ]
            │
            Writing new image...
            │
Flash: [=== NEW v1.2 ==??  ← POWER FAILS HERE

Result: BRICKED. No valid image anywhere.
Only rescue: UART/JTAG bootloader (if you remembered to add one).
\`\`\`

## Dual-Bank A/B: Power-Fail Safe

\`\`\`diagram
Flash layout (512KB total):
┌──────────────────┬──────────────────┬───────┐
│  Bank A (256KB)  │  Bank B (256KB)  │  NVM  │
│  ACTIVE v1.1 ✓  │  DOWNLOAD ZONE   │ flags │
└──────────────────┴──────────────────┴───────┘

Step 1: BLE OTA stream → write chunks to Bank B
        Bank A still runs normally ← power-fail safe here ✓
Step 2: Download complete → CRC32 verify Bank B
Step 3: Set NVM3: pending_bank = B  (single word write = atomic)
Step 4: Watchdog reset
Step 5: Bootloader: verify B → mark B active → jump to v1.2 ✓

If power fails at any point during download: Bank A untouched ✓
If Bank B CRC fails on boot: stay in Bank A forever ✓ (never bricks)
\`\`\`

## Bootloader Decision Logic

\`\`\`c
void bootloader_main(void) {
    uint32_t pending = nvm3_read(PENDING_BANK_KEY);

    if (pending == BANK_B) {
        if (crc32_verify(BANK_B_START, BANK_B_SIZE)) {
            // New image is good — swap!
            nvm3_write(ACTIVE_BANK_KEY, BANK_B);
            nvm3_write(PENDING_BANK_KEY, NONE);
            jump_to(BANK_B_START + VECTOR_TABLE_OFFSET);
        } else {
            // CRC failed — new image corrupt, stay safe
            nvm3_write(PENDING_BANK_KEY, NONE);  // clear pending
            // Fall through to active bank below
        }
    }

    // Boot active bank (default or fallback)
    uint32_t active = nvm3_read(ACTIVE_BANK_KEY);
    jump_to(active == BANK_B ? BANK_B_START : BANK_A_START);
}
\`\`\`

## CRC32 vs ECDSA-P256: When to Use Each

| Property | CRC32 | ECDSA-P256 |
|----------|-------|------------|
| Detects accidental corruption | YES | YES (via SHA-256) |
| Detects malicious tampering | NO — forgeable | YES — unforgeable without private key |
| Compute time (256KB image) | ~1ms | ~200ms |
| Code size | ~200 bytes | ~16KB (mbedTLS subset) |
| Use case | Development, internal devices | Production OTA security |

**The security argument:** An attacker who intercepts BLE OTA packets can craft a malicious image with a valid CRC32. ECDSA: the private key never leaves your build system. Device only has the public key to verify — cannot forge without the private key.

## Anti-Rollback: Monotonic Counter

\`\`\`diagram
Flash fuse word (one-way: 0-bits can only be written, not erased):

Factory state:   0x00000000  (counter = 0)
After v1.1:      0x00000001  (counter = 1, bit 0 burned)
After v1.2 fix:  0x00000003  (counter = 2, bit 1 burned)
After v1.3:      0x00000007  (counter = 3, bit 2 burned)

Attack attempt: OTA v1.1 (has security hole)
  image_version=1 < hw_counter=3 → REJECTED by bootloader ✓
\`\`\`

## Boot Counter: Crash Loop Detection

\`\`\`c
// Bootloader increments on every boot
uint32_t count = nvm3_read(BOOT_COUNT_KEY);
nvm3_write(BOOT_COUNT_KEY, count + 1);

if (count >= 3) {
    // 3 reboots without successful init = crash loop
    nvm3_write(ACTIVE_BANK_KEY, BANK_A);   // revert to previous
    nvm3_write(PENDING_BANK_KEY, NONE);
    nvm3_write(BOOT_COUNT_KEY, 0);
}

// Application: after successful initialization, clear counter
void app_startup_complete(void) {
    nvm3_write(BOOT_COUNT_KEY, 0);  // "I'm healthy"
}
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'GPIO Trace Debug — BLE + Audio Interference',
            content: `## GPIO Trace: Your Best Debugging Tool

Logic analyzers are infinitely more useful than printf for real-time firmware. Toggle GPIOs to mark task execution boundaries.

\`\`\`c
// In LDMA_IRQHandler:
GPIO_PinOutToggle(gpioPortA, 5);   // PA5: pulse on every IRQ

// In AudioProcessor task:
GPIO_PinOutSet(gpioPortA, 6);      // PA6 high = task running
// ... process audio frame ...
GPIO_PinOutClear(gpioPortA, 6);    // PA6 low = task done

// In idle hook before WFI:
GPIO_PinOutSet(gpioPortB, 0);      // PB0 high = sleeping (EM2)
EMU_EnterEM2(true);
GPIO_PinOutClear(gpioPortB, 0);    // PB0 low = awake
\`\`\`

4-channel capture reveals:
- **Gap between PA5 pulse and PA6 rising edge** = scheduling latency (should be < 1ms)
- **PA6 high duration** = DSP processing time per frame (target < 14ms, leaving 2ms margin)
- **PB0 duty cycle** = fraction of time in EM2 (want > 90%)

## The BLE Priority Conflict

\`\`\`diagram
IRQ priorities (lower number = higher priority):
  0: BLE radio (MUST NOT be masked — handles radio timing)
  5: LDMA, USART1 (can be masked by FreeRTOS critical sections)
 15: SysTick

configMAX_SYSCALL_INTERRUPT_PRIORITY = 0x50 (priority 5)
  → taskENTER_CRITICAL() masks priorities 5–15
  → BLE radio at priority 0: NEVER masked ✓
\`\`\`

**Root cause of BLE degradation:** Audio task holds AudioConfig mutex for 3ms while BLE Manager waits. BLE stack gets CPU time, but BGAPI event processing is delayed → BLE throughput drops.

**Fix:** Make mutex critical section < 200µs:
\`\`\`c
// Instead of:
xSemaphoreTake(mutex, portMAX_DELAY);
arm_rfft_fast_f32(...);  // 1ms inside mutex!
xSemaphoreGive(mutex);

// Do:
xSemaphoreTake(mutex, portMAX_DELAY);
float target = audioConfig.target;  // copy only, microseconds
xSemaphoreGive(mutex);
arm_rfft_fast_f32(...);  // outside mutex
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'System Design — All 8 Dimensions for Apple Interviews',
            content: `## The 8-Dimension Framework

In Apple system design interviews you must cover all 8 areas. Presenting them in order shows structured thinking.

## 1. Requirements (State These First — Always)

**Functional:** stereo mic capture, real-time playback, BLE config from phone, OTA firmware update
**Non-functional:** latency < 20ms, battery > 6hr on 100mAh, secure OTA, watchdog protection

## 2. Hardware Block Diagram

\`\`\`diagram
                    ┌──────────────────────────────┐
SPH0645 mic  ──I2S──┤                              ├── BLE antenna
MAX98357A amp──I2S──┤         EFR32BG13            ├── SWD/JTAG debug
Li-Po + PMIC ──────┤    (Cortex-M4F @ 38.4MHz)    │
                    └──────────────────────────────┘
\`\`\`

## 3. Software / Task Architecture

\`\`\`diagram
Priority 7: MicSampler    — blocks on LDMA IRQ queue
Priority 6: AudioProc     — blocks on MicQueue, does DSP
Priority 5: BLEManager    — handles events, sends notifications
Priority 3: NVM3Manager   — repacks flash when needed
Priority 1: WatchdogPetter— feeds WDOG only when all bits set
Priority 0: Idle          — calls EMU_EnterEM2()
\`\`\`

## 4. Data Flow

\`\`\`diagram
LDMA ──► RX BufA/B ──► MicQueue ──► AudioProc ──► TX BufA/B ──► LDMA ──► Speaker
                                        ↕
                              AudioConfig (mutex)
                                        ↕
                                   BLEManager ◄──► Phone app
\`\`\`

## 5. Memory Layout

\`\`\`diagram
Flash (512 KB):  [Bootloader 16KB][Application 480KB][NVM3 16KB]
SRAM  (64 KB):   [.data/.bss 4KB][DMA buffers 4KB][Heap 32KB][Stacks 16KB][Margin 8KB]
\`\`\`

## 6. Power Budget

\`\`\`
Active audio frame: 16ms × 5.5mA = 88 µAh per frame
EM2 sleep: 484ms × 1.4µA = 0.68 µAh per frame
Average per CI (500ms): (88+0.68)/500 × 1000 = ~177 µA
+ BLE radio: ~20 µA avg
Total: ~197 µA → 100mAh / 0.197mA = ~508 hours ≈ 21 days
\`\`\`

## 7. Security

ECDSA-P256 signed OTA images · Anti-rollback monotonic counter · BLE bonding with LTK · WDOG locked in production · NVM3 for key/config storage

## 8. Failure Modes

| Failure | Mitigation |
|---|---|
| Power fail during OTA | Dual-bank: active bank never modified |
| Flash page dies | NVM3 wear leveling across pages |
| Task deadlock | Watchdog bitmask: must-check-in or reset |
| Stack overflow | Mode 2 sentinel + hook |
| BLE supervision timeout | Bonding + auto-reconnect |`,
          },
        ],
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
        readingNotes: [
          {
            source: 'DWT Benchmarking & DSP Optimization Strategy',
            content: `## Step 1: Measure Before You Optimize

Never guess which function is slow. DWT gives you exact cycle counts.

\`\`\`c
// Enable once at startup
CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
DWT->CYCCNT = 0;
DWT->CTRL  |= DWT_CTRL_CYCCNTENA_Msk;

// Wrap any function
uint32_t t0 = DWT->CYCCNT;
arm_rfft_fast_f32(&fftInst, in, out, 0);
uint32_t fft_cycles = DWT->CYCCNT - t0;
// At 38.4 MHz: us = fft_cycles / 38.4
\`\`\`

## Frame Budget Reality Check

\`\`\`diagram
16ms frame = 614,400 cycles at 38.4 MHz

Measured costs (typical):
  arm_rms_f32(256)              ~   800 cycles  (0.02 ms)
  arm_rfft_fast_f32(256)        ~ 8,000 cycles  (0.21 ms)
  arm_cmplx_mag_f32(128)        ~ 1,500 cycles  (0.04 ms)
  arm_scale_f32(256)            ~   500 cycles  (0.01 ms)
  xQueueSend + context switch   ~   500 cycles  (0.01 ms)
  ─────────────────────────────────────────────────────
  Total DSP per frame           ~11,300 cycles  (0.29 ms)
  Available for sleep/BLE       ~603,000 cycles (15.7 ms) ✓ headroom
\`\`\`

If 80% CPU consumed: something is wrong. Use \`vTaskGetRunTimeStats()\` to find which task.

## Optimization Ladder (In Order)

**Step 1 — FFT every Nth frame:**
Wind changes at ~5 Hz. At 62.5 Hz frame rate, run FFT every 4th frame → 15.6 Hz update, 3× less FFT cost.

**Step 2 — Smaller FFT:**
FFT-256: ~8,000 cycles. FFT-128: ~3,500 cycles. Frequency resolution: 62.5 Hz/bin → 125 Hz/bin. Still sufficient for wind vs speech separation.

**Step 3 — Verify FPU is actually used:**
\`\`\`
# Check compile flags:
arm-none-eabi-gcc ... -mfpu=fpv4-sp-d16 -mfloat-abi=hard

# Verify in disassembly:
arm-none-eabi-objdump -d firmware.elf | grep -E "vmul|vadd|vsqrt"
# If you see software __aeabi_fmul calls instead → missing -mfloat-abi=hard
\`\`\`

Soft-float vs hard-float FPU: 50–100× slower. This is the most common DSP performance bug.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Cache Coherency — Cortex-M4F vs Cortex-A',
            content: `## Why Cache Coherency Exists

Modern CPUs are much faster than DRAM. Caches store copies of DRAM contents close to the CPU for speed. The problem: when DMA and CPU both access the same memory, they may see different versions of the data.

\`\`\`diagram
Cortex-M4F (our EFR32BG13) — NO data cache:

CPU ──────────────────────────────┐
                                   ├── AHB Bus Matrix ── SRAM
DMA (LDMA) ───────────────────────┘

Both access SRAM directly via AHB. Always coherent. No maintenance needed.
This is why we never had cache issues with ping-pong DMA.
\`\`\`

\`\`\`diagram
Cortex-A (Apple custom silicon, A-series) — L1 D-cache:

CPU ── L1 D-cache (32KB) ── L2 cache (shared) ── DRAM
                                                      ↑
DMA ──────────────────────────────────────────────────┘

CPU writes go to L1 cache first (write-back mode).
DMA reads from DRAM directly — may see STALE data!
\`\`\`

## The Two Cache Coherency Bugs

**Bug 1 — DMA TX (transmit) with stale DRAM:**

\`\`\`diagram
Timeline:
1. CPU: audio_buf[0..255] = processed_samples   → goes to L1 cache
2. CPU: start_dma_tx(audio_buf, 256)
3. DMA: reads audio_buf from DRAM               → reads OLD values!
4. MAX98357A: plays garbage audio

Fix: SCB_CleanDCache_by_Addr(audio_buf, 256*4)  // flush cache → DRAM
     start_dma_tx(audio_buf, 256)                // now DMA reads correct
\`\`\`

**Bug 2 — DMA RX (receive) with stale cache:**

\`\`\`diagram
Timeline:
1. DMA: writes mic_buf[0..255] = new I2S data   → writes to DRAM
2. CPU: process(mic_buf)
3. CPU reads mic_buf from L1 cache              → reads OLD values!
4. Audio processing uses wrong samples

Fix: start_dma_rx(mic_buf, 256)
     wait_for_dma_complete()
     SCB_InvalidateDCache_by_Addr(mic_buf, 256*4)  // discard stale cache
     process(mic_buf)                               // now reads from DRAM
\`\`\`

## Cache Maintenance API (ARM CMSIS)

\`\`\`c
// Clean: write dirty cache lines to DRAM (cache lines remain valid)
// Use BEFORE DMA TX — ensure DMA reads updated data
SCB_CleanDCache_by_Addr((uint32_t*)buf, len);

// Invalidate: discard cache lines (force next read from DRAM)
// Use AFTER DMA RX — force CPU to read new DMA-written data
SCB_InvalidateDCache_by_Addr((uint32_t*)buf, len);

// Clean + Invalidate: both (use when you need absolute safety)
SCB_CleanInvalidateDCache_by_Addr((uint32_t*)buf, len);
\`\`\`

## Cache Line Alignment — Critical Detail

\`\`\`diagram
Cache line = 64 bytes on most Cortex-A processors.

WRONG — buffer not aligned to cache line:
  buf starts at 0x2000_0010 (offset 16 bytes into cache line)

  Cache line: [----buf_start----buf_end----OTHER_DATA----]
              |                            |
  Invalidate entire cache line:
  [---- garbage ----buf_end----OTHER_DATA CORRUPTED ----]
                                ↑ Adjacent data destroyed!

CORRECT — align to cache line:
  __attribute__((aligned(32))) uint32_t mic_buf[256];
  // Now buf_start is always at start of a cache line
\`\`\`

## MPU Non-Cacheable Regions (Simpler Alternative)

For shared DMA buffers, mark the MPU region as Non-Cacheable — then no explicit maintenance needed at all:

\`\`\`c
// Mark DMA buffer region as Normal Non-cacheable
MPU->RBAR = AUDIO_BUF_BASE | MPU_RBAR_VALID_Msk | (region << MPU_RBAR_REGION_Pos);
MPU->RASR = MPU_RASR_ENABLE_Msk
          | (0b010 << MPU_RASR_AP_Pos)     // RW for privileged
          | (0b001 << MPU_RASR_TEX_Pos)    // Normal, Non-cacheable
          | (size_bits << MPU_RASR_SIZE_Pos);
// Now: CPU reads/writes go directly to SRAM. DMA always coherent.
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Power Budget Methodology for Wearables',
            content: `## Step 1: Calculate Average Current Budget

**Formula:** avg_current (µA) = capacity_mAh / runtime_hours × 1000

For 7-day wearable on 100mAh:
\`\`\`diagram
budget = 100mAh / (7 days × 24 h/day) = 100 / 168 = 0.595 mA = 595 µA
\`\`\`

This is the TOTAL average current across everything — MCU, BLE, sensors, display. You must stay under this.

## Step 2: Model Each Subsystem With Duty Cycle

**Formula for a subsystem:** avg_I = I_active × duty + I_sleep × (1 - duty)

\`\`\`diagram
BLE Connection Interval = 500ms, event duration = 5ms:

duty = 5ms / 500ms = 1%

avg_I_BLE = 5mA × 0.01 + 1.4µA × 0.99
          = 50µA    + 1.4µA
          = ~51.4 µA
\`\`\`

\`\`\`diagram
HR sensor (MAX30101 PPG): 1mA active, 1 Hz sampling, 20ms burst:

duty = 20ms / 1000ms = 2%

avg_I_HR = 1mA × 0.02 + 1µA × 0.98
         = 20µA + ~1µA
         = ~21 µA when always running
\`\`\`

## Step 3: Apply Gating to Reduce Dominant Consumers

HR sensor is the dominant consumer. Accel as motion gate:
\`\`\`diagram
Strategy: ADXL362 accelerometer runs at ~2µA in motion detection mode.
If no motion for 10 seconds → disable HR sensor.

At 40% motion duty cycle:
avg_I_HR (gated) = 21µA × 0.40 = 8.4 µA   (saves 12.6 µA!)
\`\`\`

## Step 4: Build the Budget Table

\`\`\`diagram
Subsystem              Active I   Duty    Avg I
─────────────────────────────────────────────────
MCU (EFR32BG13 EM0)    4.5 mA    1.2%    ~53 µA
BLE radio events        5 mA      1%      ~51 µA
Accelerometer (ADXL)   ~2 µA     100%    ~2 µA
HR sensor (gated 40%)  1 mA      0.8%    ~8 µA
─────────────────────────────────────────────────
Total                                   ~114 µA

Budget = 595 µA → 5× margin!
Margin available for: display, speaker, GPS, or 35-day runtime.
\`\`\`

## Always-On Architecture Pattern

\`\`\`diagram
Apple Watch S-series: 2 processor dies

Main SoC (power-hungry):                Sensor Hub (ultra-low power):
┌─────────────────────┐                ┌─────────────────────┐
│ Application CPU     │                │ Always-on processor │
│ GPU                 │                │ Accel, gyro polling │
│ BLE/WiFi            │◄── Wake IRQ ───│ Heart rate detect   │
│ Neural Engine       │                │ Tap/fall detection  │
│                     │                │                     │
│ Sleeps 99% of time  │                │ ~10-50 µA 24/7      │
└─────────────────────┘                └─────────────────────┘

EFR32BG13 equivalent:
Main MCU in EM2 → LESENSE peripheral monitors sensors autonomously
→ IRQ wakes CPU only when threshold crossed
\`\`\`

## Measuring vs Estimating

\`\`\`diagram
Silicon Labs Energy Profiler: measures current via VMCU rail
  Resolution: ~0.1µA, sample rate: 100kHz

Profile sequence:
1. MCU alone in EM2 → baseline (should be ~1.4µA)
2. Add BLE advertising → measure delta
3. Add one sensor at a time → measure delta per sensor
4. Combined → look for unexpected interactions
   (e.g., I2C noise waking MCU unexpectedly)

Real measurement ALWAYS differs from datasheet by 10-30%.
Use Otii Arc for independent validation of Energy Profiler readings.
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'ANC Architecture — Feedforward, Feedback & FxLMS',
            content: `## How ANC Works: Anti-Phase Cancellation

**Core principle:** For every noise wave, play the exact inverse wave at the eardrum. The two waves destructively interfere → silence.

\`\`\`diagram
Noise wave:     ╱╲    ╱╲    ╱╲
Anti-phase:    ╲╱    ╲╱    ╲╱
               ───────────────── = Silence at eardrum

Works well for: periodic engine rumble, HVAC hum, train noise
Limited for:   transient impacts (clap), random broadband noise
\`\`\`

## Feedforward vs Feedback: Two Microphone Strategies

\`\`\`diagram
Feedforward (FF) microphone — mounted OUTSIDE earbud:

    Outside world                    Inside ear
    ────────────────────────────────────────────

    [NOISE] ──► FF mic ──► DSP filter ──► Speaker
               ↑ captured   ↑             ↑
               here     2-5ms to        plays anti-phase
                        compute         before noise arrives

Advantage: 2-5ms window to compute complex filter (many taps)
Disadvantage: cannot compensate for seal variation
\`\`\`

\`\`\`diagram
Feedback (FB) microphone — mounted INSIDE earbud:

    Speaker ──► [ear canal] ──► FB mic ──► DSP
       ↑                                   │
       └─────── correction signal ─────────┘
                (closed loop)

Advantage: measures ACTUAL residual noise at eardrum
           compensates for different ear canal shapes and seal quality
Disadvantage: must be <0.5ms (very tight — filter is simple)
\`\`\`

## AirPods Pro Hybrid: Both Mics Together

\`\`\`diagram
AirPods Pro H1/H2 chip:

FF mic (outer) ──► Primary broadband cancellation (complex FIR)
FB mic (inner) ──► Seal-variation compensation (simple IIR)
                                │
                              Sum ──► Speaker output

Why hybrid is better:
  FF alone: fails when ear canal shape changes ANC response
  FB alone: limited bandwidth (must be fast)
  Hybrid: robust across all users and fit scenarios
\`\`\`

## FxLMS: The Adaptive Algorithm

**FxLMS (Filtered-x Least Mean Squares):** Adaptive filter that updates its own coefficients in real time to minimize the error microphone signal.

\`\`\`diagram
FxLMS block diagram:

Noise (d) ──────────────────────────────────┐
                                             │ (sum = error)
Reference ──► W(z) filter ──► Speaker ──► Error mic ──► e(t)
mic (x)        ↑                     ──► Ŝ(z) model ──►│
               │                                        │
               └──────── LMS update: W = W - µ·x̂·e ────┘
                         (adjust filter to minimize e)

Ŝ(z) = secondary path model (speaker→feedback mic transfer function)
Must be measured and stored. FxLMS diverges without it.
\`\`\`

## Why EFR32BG13 Cannot Do Real ANC

\`\`\`diagram
ANC latency requirement:   < 0.5ms for feedback loop
EFR32BG13 @ 38.4 MHz:

FreeRTOS task switch:      ~10µs   (task scheduling overhead)
I2S frame interrupt:        16ms   (256 samples at 16kHz)
ADC→DAC pipeline:           17ms  (our total transparency latency)

17ms >> 0.5ms. Not even close.

Real ANC requires:
  - Hardware ADC → DSP → DAC pipeline (no software scheduling)
  - Fixed-latency hardware filter (Apple H1/H2 dedicated DSP)
  - Sample rates: 48kHz (not 16kHz) = 20µs per sample
  - Clock: >200 MHz DSP core with SIMD instructions
\`\`\`

**Our project vs ANC:** Our FFT-based wind detection is NOT ANC. It's heuristic wind noise reduction — detects wind energy > speech energy, reduces output gain. Similar to "wind noise reduction" mode on a camcorder. Honest about this distinction in interviews.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'ARM Cortex-M4F TRM §C1–C2 — ITM & DWT Debug Components',
            content: `## Why UART Debug Breaks Real-Time Systems

\`\`\`diagram
UART debug at 115200 baud:
  1 byte = 10 bits (1 start + 8 data + 1 stop) = 87 µs blocking

Our audio frame = 16ms. One printf("frame %d\n") = ~10 chars = 870µs
  → 5.4% of frame budget STOLEN by debug output
  → timing-sensitive bugs disappear when you add debug (Heisenbug)

ITM/SWO write:
  ITM->PORT[0].u32 = timestamp;  // 1 CPU cycle if FIFO not full
                                  // 0 cycles if no debugger connected
  → Never disrupts timing
\`\`\`

## CoreSight Architecture

\`\`\`diagram
CPU
 │
 ├── DWT (Data Watchpoint & Trace) ─── hardware watchpoints, CYCCNT
 ├── ITM (Instrumentation Trace) ───── your printf-style debug
 ├── ETM (Embedded Trace Macrocell) ── full instruction trace
 │
 ▼
TPIU (Trace Port Interface Unit)
 │
 ▼
SWO pin ──── J-Link ──── SWO Viewer on host PC
\`\`\`

## ITM: Non-Blocking Debug Logging

\`\`\`c
// Setup (once at init):
CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;  // enable trace
ITM->TER = 0x0F;   // enable ports 0-3
ITM->TCR |= ITM_TCR_ITMENA_Msk;

// Usage — writes 1 word in 1 cycle (or dropped if FIFO full):
void itm_log(uint8_t port, uint32_t value) {
    if (ITM->PORT[port].u32 == 0) return;  // not ready (FIFO full)
    ITM->PORT[port].u32 = value;            // atomic 1-cycle write
}

// Port assignment:
// Port 0: general debug values
// Port 1: audio frame timestamp (call at LDMA IRQ)
// Port 2: BLE event IDs
// Port 3: error/fault codes
\`\`\`

**SWO bandwidth:** At 4 MHz SWO clock: ~400-800 KB/s. At 62.5 IRQs/sec with 4-byte timestamp: 62.5 × 4 = 250 bytes/sec — negligible.

## DWT Cycle Counter: Zero-Overhead Benchmarking

\`\`\`c
// Enable DWT cycle counter:
CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
DWT->CYCCNT = 0;
DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;

// Benchmark any function:
uint32_t t0 = DWT->CYCCNT;
arm_rfft_fast_f32(&fftInst, input, output, 0);
uint32_t cycles = DWT->CYCCNT - t0;  // exact cycle count
float ms = (float)cycles / 38400.0f; // at 38.4 MHz
\`\`\`

## DWT Hardware Watchpoints

4 hardware watchpoints — no code modification needed, no performance impact:

\`\`\`diagram
Hardware watchpoint on audio_config.gain:

DWT->COMP0 = (uint32_t)&audio_config.gain;  // address to watch
DWT->MASK0 = 0;                              // exact address
DWT->FUNCTION0 = 0x6;                        // write watchpoint

When ANY code writes to audio_config.gain:
  → DebugMon exception fires
  → PC in exception frame = instruction that wrote the variable
  → No need for conditional breakpoints or instrumentation
\`\`\`

## UART vs ITM: Side by Side

| Property | UART printf | ITM/SWO |
|----------|-------------|---------|
| Latency | 87µs/byte (blocking) | 1 cycle (fire-and-forget) |
| Timing impact | HIGH (Heisenbug risk) | NONE |
| Bandwidth | 11.5 KB/s | 400-800 KB/s |
| Available pins | 2 (TX/RX) | 1 (SWO) |
| Works without debugger | YES | NO (silent drop) |
| Multiple channels | NO | YES (32 ports) |`,
          },
        ],
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
        readingNotes: [
          {
            source: 'GCC Security Flags & Static Analysis for Embedded',
            content: `## The Stack Canary: -fstack-protector-strong

**What it does:** GCC inserts a random "canary" value between local buffers and the saved return address. On function return, it checks the canary. Buffer overflow overwrites the canary → detected.

\`\`\`diagram
Stack frame WITHOUT canary:

  ┌──────────────────────┐
  │  saved LR (return)   │ ← attacker overwrites this
  │  saved r7            │
  ├──────────────────────┤
  │  char buf[64]        │ ← buffer overflow fills upward
  │  (overflow here →)   │ ────────────────────────────►
  └──────────────────────┘

Stack frame WITH -fstack-protector-strong:

  ┌──────────────────────┐
  │  saved LR (return)   │
  │  saved r7            │
  ├──────────────────────┤
  │  CANARY (random u32) │ ← canary sits above locals
  ├──────────────────────┤
  │  char buf[64]        │
  └──────────────────────┘

Buffer overflows buf → overwrites canary → on return:
  if (canary != original) → __stack_chk_fail() → system reset
\`\`\`

\`\`\`c
// Must implement __stack_chk_fail in your firmware:
void __stack_chk_fail(void) {
    __disable_irq();                    // stop all interrupts
    // Log fault to NVM if possible
    nvm3_write(FAULT_KEY, FAULT_STACK_OVERFLOW);
    NVIC_SystemReset();                 // controlled reset
}
\`\`\`

**-fstack-protector-strong** applies to functions with: arrays, alloca(), or address-taken local variables. Better than -fstack-protector (any single buffer) with less overhead than -fstack-protector-all (every function).

## Warning Flags You Must Enable

\`\`\`
# Minimum for embedded firmware:
arm-none-eabi-gcc -Wall -Wextra -Wformat=2 -Wconversion
                  -Wstack-usage=512 -fstack-protector-strong
                  -O2 -g
\`\`\`

| Flag | What it catches |
|------|-----------------|
| -Wall | Unused vars, implicit function declarations, missing returns |
| -Wextra | Signed/unsigned comparison, missing field initializers |
| -Wformat=2 | printf format string injection (non-literal format args) |
| -Wconversion | Silent truncation: uint32_t→uint8_t loses bits |
| -Wstack-usage=512 | Functions using >512 bytes stack (ISR budget exceeded) |

## Security Audit Checklist for Audio Firmware

\`\`\`
1. No magic numbers in BLE/I2S parsing
   BAD:  if (ble_len > 243) → BLE_MTU_MAX
   GOOD: if (ble_len > BLE_MAX_PAYLOAD) with #define BLE_MAX_PAYLOAD 243

2. Check ALL API return values
   BAD:  LDMA_StartTransfer(ch, &cfg, desc);   // ignored
   GOOD: if (!LDMA_StartTransfer(...)) handle_error();

3. No malloc/free in audio path after init
   Audio ISR must NEVER call pvPortMalloc() — use static buffers

4. Shared variables: mutex or _FromISR APIs
   BAD:  audioConfig.gain = new_gain;  // from ISR, race!
   GOOD: xQueueSendFromISR(gainQ, &new_gain, &woken);

5. ISR APIs only in ISR context
   BAD:  xQueueSend() from ISR (can block, crashes FreeRTOS)
   GOOD: xQueueSendFromISR() from ISR (non-blocking)
\`\`\`

## Production Build Flags

\`\`\`
NEVER use -O0 in production — it changes:
  - Stack usage (up to 3× more variables stay on stack)
  - Timing (loops unrolled vs not)
  - Code that passes -O0 testing may fail -O2 in field

Production: -O2 -g
  -O2: optimized (matches what ships)
  -g:  debug info kept (for post-mortem coredump analysis)
  Result: ELF with full symbols, stripped binary = shipping image
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Binary Protocol Framing — COBS, Length-Prefix, Escape',
            content: `## The Framing Problem

**Problem:** Receiver must know exactly where each packet starts and ends in a byte stream. Trivial for ASCII (newline delimiter), broken for binary data.

\`\`\`diagram
Byte stream (UART RX ring buffer):
  ... 0x31 0x7E 0x00 0x2A 0x0A 0x7E 0xFF ...
                 ↑              ↑
              where does packet start/end?
\`\`\`

## Three Framing Approaches

\`\`\`diagram
1. LENGTH-PREFIX: [2-byte length][payload]

  Pros: simple
  Fatal flaw: if length bytes get corrupted → recv misaligned FOREVER
  No way to resync. All subsequent packets wrong.

  [0x00][0x0A][payload...][0x02][0x0B][payload2...]
     ↑ corrupted to 0x02 → recv reads 2 bytes, skips packet boundary

2. DELIMITER (e.g., 0x0A newline):

  Works for ASCII text. Breaks for binary:
  Payload: [0x31, 0x0A, 0x7F, ...]
                   ↑ delimiter IN PAYLOAD = false end-of-frame!

3. ESCAPE CODING (HDLC-style):
  Escape byte = 0x7D. Delimiter byte = 0x7E.
  Replace 0x7E in payload with: 0x7D, 0x7E^0x20 = 0x7D, 0x5E
  Replace 0x7D in payload with: 0x7D, 0x7D^0x20 = 0x7D, 0x5D
  Overhead: doubles the count of 0x7E/0x7D bytes in payload.
\`\`\`

## COBS: The Elegant Solution

**Key insight:** Eliminate ALL 0x00 bytes from the encoded data, then use 0x00 as an unambiguous delimiter. Max overhead: 1 byte per 254 bytes = ~0.4%.

\`\`\`diagram
COBS encoding algorithm:

Input data: [0x11, 0x00, 0x22, 0x33, 0x00, 0x44]

Step 1: Break at zero bytes:
  Run 1: [0x11]          → length 1
  Run 2: [0x22, 0x33]    → length 2
  Run 3: [0x44]          → length 1

Step 2: Encode each run with (length+1) overhead byte:
  [0x02, 0x11]  (overhead=2: skip 2 bytes to next overhead)
  [0x03, 0x22, 0x33]  (overhead=3: skip 3 bytes)
  [0x02, 0x44]  (overhead=2)

Step 3: Append 0x00 terminator:
  Encoded: [0x02, 0x11, 0x03, 0x22, 0x33, 0x02, 0x44, 0x00]
                                                         ↑ delimiter
  No 0x00 bytes in the payload! ✓
\`\`\`

## COBS in C

\`\`\`c
// COBS encode: returns encoded length
size_t cobs_encode(const uint8_t *in, size_t len, uint8_t *out) {
    size_t out_idx = 0;
    size_t overhead_idx = out_idx++;   // reserve overhead byte
    uint8_t run_len = 1;

    for (size_t i = 0; i < len; i++) {
        if (in[i] != 0x00) {
            out[out_idx++] = in[i];
            run_len++;
            if (run_len == 0xFF) {     // max run length
                out[overhead_idx] = run_len;
                overhead_idx = out_idx++;
                run_len = 1;
            }
        } else {
            out[overhead_idx] = run_len;  // write overhead
            overhead_idx = out_idx++;      // new overhead slot
            run_len = 1;
        }
    }
    out[overhead_idx] = run_len;
    out[out_idx++] = 0x00;  // frame delimiter
    return out_idx;
}
\`\`\`

## Why 0x00 as Delimiter?

\`\`\`diagram
UART break condition = line held low = received as 0x00.
0x00 is therefore a "natural" line idle signal.

RX ring buffer scan:  uint8_t *end = memchr(buf, 0x00, len);
  → hardware-optimized, single instruction on ARM (LDRB + CMP)
  → Fastest possible delimiter scan
\`\`\`

**BLE context:** BLE ATT has its own framing (ATT_MTU with length fields) — COBS not needed there. But for the UART debug port: COBS + 0x00 delimiter is the standard. At 38.4 MHz: COBS encoding 256 bytes ≈ 300 cycles = 7.8µs. Negligible.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'PMIC & Power Sequencing — Latch-up, DVFS, Rail Dependencies',
            content: `## Latch-Up: The Hidden CMOS Danger

Every CMOS chip contains parasitic transistors by construction — they're unavoidable side effects of the fabrication process. Normally dormant. But trigger them and you get a short circuit.

\`\`\`diagram
N-well CMOS cross-section (parasitic SCR):

p+ (PMOS S/D)
     │                     ↓ current path when latched
n-well ──┐  ← parasitic PNP base/collector
         │
p-sub ───┤  ← parasitic NPN base/collector
         │
n+ (NMOS S/D)

Trigger: forward-bias either parasitic junction.
Result: SCR (thyristor) turns on → VDD shorts to GND → high current
        chip gets hot → fuses burn → permanent damage
\`\`\`

**Trigger condition:** Any I/O pin driven outside [GND - 0.3V, VDD + 0.3V] while chip is powered.

\`\`\`diagram
Scenario: MCU powered, MAX98357A speaker amp NOT yet powered

MCU                    MAX98357A
VDD=3.3V              VDD=0V (off)

MCU drives I2S BCLK = 3.3V
  → arrives at MAX98357A BCLK pin
  → MAX98357A internal ESD diode clamps to VDD+0.7V = 0V+0.7V = 0.7V
  → BCLK = 3.3V vs MAX98357A sees 3.3V - 0.7V = 2.6V on its internal rail
  → Parasitic forward bias → latch-up risk!

Fix: power MAX98357A VDD before driving I2S signals
\`\`\`

## Power Sequencing Rules

\`\`\`diagram
CORRECT power-ON sequence:

Step 1: PMIC enables V_IO (3.3V) ── MCU core, logic rails
Step 2: V_IO stable → PMIC enables V_AUD (speaker amp)
Step 3: V_AUD stable → MCU enables I2S signals
Step 4: V_RF (BLE radio) — last, most sensitive to noise

CORRECT power-OFF (reverse order):
Step 1: MCU disables I2S signals first
Step 2: Disable V_AUD
Step 3: Disable V_IO last

In both cases: signals never applied to unpowered chips ✓
\`\`\`

## DVFS: Dynamic Voltage & Frequency Scaling

**Physics:** Dynamic power = C × V² × f. Two knobs: voltage and frequency.

\`\`\`diagram
Power savings example:

Full speed:      f = 38.4 MHz, V = 3.3V
  P = C × 3.3² × 38.4M = C × 10.9 × 38.4M = baseline

Half speed:      f = 19.2 MHz, V = 1.8V (lower V possible at lower f)
  P = C × 1.8² × 19.2M = C × 3.24 × 19.2M = 0.30 × baseline

Result: 3.3× power reduction from halving f and reducing V to 1.8V!
\`\`\`

\`\`\`diagram
DVFS transition sequence (CRITICAL — wrong order = incorrect timing):

Increasing performance:
  1. Raise voltage first (PMIC command, wait ~50µs for stabilization)
  2. Then raise frequency (PLL/CMU change)
  → CPU never runs at too-high frequency for current voltage ✓

Decreasing performance:
  1. Lower frequency first
  2. Then lower voltage
  → CPU never runs at too-low voltage for current frequency ✓
\`\`\`

## EFR32BG13 Integrated DC-DC Converter

\`\`\`diagram
Without DC-DC: 3.6V battery → 3.6V internal rail
  EFR32BG13 active current @ 38.4MHz: ~4.5 mA

With DC-DC: 3.6V battery → 1.8V internal rail (buck converter 85% eff)
  Lower internal voltage → less dynamic power
  Typical savings: 20-30% overall current reduction

Enable in EMU_DCDCINIT_STK_DEFAULT config.
Disable before EM4 entry (DC-DC doesn't work in EM4).
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'HAL Design & Audio Path Memory Rules',
            content: `## Why Dynamic Allocation is Forbidden in Audio Path

\`\`\`diagram
pvPortMalloc() (FreeRTOS heap_4) — O(N) search:

Fresh heap:
  [====FREE====================================]
  pvPortMalloc(1024) → finds in 1 search step

After hours of mixed alloc/free:
  [USED][free:512][USED][free:256][USED][free:768][USED]...
  pvPortMalloc(1024) → searches all fragments, finds NONE
                     → returns NULL → NULL deref in audio path!

Even before exhaustion: search time is unpredictable.
In a 16ms frame budget, you cannot afford 1ms of heap scanning.
\`\`\`

**Three problems with malloc in real-time paths:**
1. Non-deterministic latency (O(N) search → frame deadline miss)
2. Fragmentation over hours → \`malloc\` returns NULL mid-operation
3. No safe recovery: buffer partially processed when malloc fails → audible glitch

## Solutions: Static and Block-Pool Allocation

\`\`\`c
// WRONG: dynamic allocation in audio ISR
void LDMA_IRQHandler(void) {
    int32_t *frame = pvPortMalloc(256 * sizeof(int32_t));  // NO!
    // ...
}

// CORRECT: static allocation at compile time
static int32_t rx_buf_a[256];  // guaranteed, link-time size check
static int32_t rx_buf_b[256];

// ALSO CORRECT: block pool (for variable consumers)
// At startup (before scheduler):
static int32_t pool_storage[4][256];
static QueueHandle_t buf_pool;

void audio_hal_init(void) {
    buf_pool = xQueueCreate(4, sizeof(int32_t*));
    for (int i = 0; i < 4; i++) {
        int32_t *ptr = pool_storage[i];
        xQueueSend(buf_pool, &ptr, 0);  // O(1), deterministic
    }
}

int32_t* audio_hal_acquire_buf(void) {
    int32_t *buf;
    xQueueReceive(buf_pool, &buf, 0);  // O(1), fails immediately if empty
    return buf;
}
\`\`\`

## HAL Module Boundary Enforcement

\`\`\`diagram
Bad architecture (app code has raw register access):

app_task.c:
  LDMA->CTRL = ...;          // register access in application layer
  USART1->CMD = USART_CMD_RXEN;  // hardware coupling everywhere

Good architecture (HAL owns all hardware):

audio_hal.h:              (the only visible interface)
  hal_err_t audio_hal_init(const audio_config_t *cfg);
  int32_t*  audio_hal_get_rx_buffer(uint32_t timeout_ms);
  void      audio_hal_release_rx_buffer(int32_t *buf);

audio_hal.c:              (hidden implementation)
  static LDMA_Descriptor_t s_dma_desc[2];  // private
  static int32_t s_buf_a[256], s_buf_b[256];  // private
  // All LDMA, USART1 register access here, nowhere else
\`\`\`

## HAL Design Rules

\`\`\`
Rule 1: HAL owns ALL register access
  No raw LDMA, USART, GPIO writes outside hal/*.c files

Rule 2: Named constants, no magic numbers
  BAD:  LDMA->CTRL = 0x00000001;
  GOOD: LDMA->CTRL = LDMA_CTRL_NUMFIXED_DEFAULT;

Rule 3: Return error codes from all HAL functions
  BAD:  void audio_hal_init(void);  // silent failure
  GOOD: hal_err_t audio_hal_init(void);  // caller handles errors

Rule 4: HAL init runs before scheduler (in main())
  LDMA_Init() before vTaskStartScheduler()
  Once scheduler runs, init race conditions are possible

Rule 5: No HAL state shared across modules without explicit API
  MicSampler task NEVER touches AudioProcessor's internal buffers
  Only via queue messages
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'ARM Cortex-M4F TRM §B1.5.8 — EXC_RETURN & Exception Frame',
            content: `## What is EXC_RETURN?

When an exception fires, the hardware writes a special "magic" value into LR. This value encodes exactly where to return to and what state to restore. It looks like a return address but starts with 0xFFFFFF — impossible for real code.

\`\`\`diagram
EXC_RETURN values (written by hardware to LR on exception entry):

0xFFFFFFF1 — Return to Handler mode, use MSP
             (used when HardFault fires inside another ISR — nested)

0xFFFFFFF9 — Return to Thread mode, use MSP
             (used when HardFault fires in privileged thread with MSP)

0xFFFFFFFD — Return to Thread mode, use PSP  ← most common in FreeRTOS
             (used when HardFault fires in a normal FreeRTOS task)
\`\`\`

## Key Bits in EXC_RETURN

\`\`\`diagram
EXC_RETURN bit layout:
  Bit 4: 1 = basic frame (no FPU), 0 = extended frame (FPU pushed)
  Bit 3: 1 = Thread mode, 0 = Handler mode
  Bit 2: 1 = PSP was active (SPSEL=1), 0 = MSP was active

  0xFFFFFFFD = 1111...1111 1101
                               ↑ bit[2]=1 → PSP
                             ↑   bit[3]=1 → Thread mode
                           ↑     bit[4]=1 → basic frame
\`\`\`

**Why bit[2] matters for HardFault handler:**
In FreeRTOS, tasks run in Thread mode with PSP. So when a task crashes:
- EXC_RETURN = 0xFFFFFFFD (bit[2]=1 → PSP has the crash frame)
- MSP was NOT the active stack — MSP points to the OS/ISR stack
- You must read PSP, not MSP, to find the faulting PC!

## Exception Frame Layout

\`\`\`diagram
Stack when exception fires (basic frame, 8 words):

SP before interrupt →  ┌────────────┐
                        │   xPSR     │  [7] EPSR/IPSR/APSR
                        │   PC       │  [6] ← FAULTING PC (this is what you want)
                        │   LR       │  [5] Link register before fault
                        │   r12      │  [4]
                        │   r3       │  [3]
                        │   r2       │  [2]
                        │   r1       │  [1]
SP after interrupt  →   │   r0       │  [0]
                        └────────────┘

Extended frame (when FPU was in use, bit[4]=0):
  Same 8 words above PLUS S0-S15 (16 words) PLUS FPSCR = 26 words
  Note: frame[6] is STILL the PC — integer registers come first
\`\`\`

## HardFault Handler: Reading the Faulting PC

\`\`\`c
// ARM assembly stub — select correct stack based on EXC_RETURN bit[2]
__attribute__((naked)) void HardFault_Handler(void) {
    __asm volatile (
        "TST LR, #4        \n"   // test bit[2]: PSP or MSP?
        "ITE EQ            \n"
        "MRSEQ R0, MSP     \n"   // bit[2]=0 → use MSP
        "MRSNE R0, PSP     \n"   // bit[2]=1 → use PSP (FreeRTOS task)
        "B hard_fault_c    \n"
    );
}

// C handler receives the correct stack pointer
void hard_fault_c(uint32_t *frame) {
    uint32_t pc   = frame[6];   // faulting instruction address
    uint32_t lr   = frame[5];   // LR at point of fault
    uint32_t xpsr = frame[7];   // processor state at fault

    // Read fault registers
    uint32_t cfsr = SCB->CFSR;   // tells you WHY it faulted
    uint32_t hfsr = SCB->HFSR;
    uint32_t mmfar = SCB->MMFAR; // address that caused MemManage fault
    uint32_t bfar  = SCB->BFAR;  // address that caused BusFault

    // Log to NVM3, then reset
    fault_log_save(pc, cfsr, mmfar, bfar);
    NVIC_SystemReset();
}
\`\`\`

## Thread Mode vs Handler Mode

\`\`\`diagram
Execution contexts:

Handler mode: ALL ISRs and exceptions execute here
  - Always uses MSP (Main Stack Pointer)
  - Privileged access
  - EXC_RETURN bit[3]=0

Thread mode: Normal application code (including FreeRTOS tasks)
  - Uses PSP (Process Stack) when FreeRTOS is running
  - Can be privileged or unprivileged (controlled by CONTROL register)
  - EXC_RETURN bit[3]=1

FreeRTOS sets CONTROL.SPSEL=1 at task start → tasks use PSP
OS itself (idle task context, scheduler) uses MSP
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Coding Practice — CRC32, LDMA Descriptors, I2C Recovery',
            content: `## CRC32: Implement from Memory

**Polynomial:** IEEE 802.3 CRC32 uses 0x04C11DB7. For LSB-first (right-shift) processing, use the bit-reversed form: **0xEDB88320**.

\`\`\`c
// CRC32 — bit-reversed (LSB-first), no lookup table
// Init: 0xFFFFFFFF. Final: invert result.
uint32_t crc32(const uint8_t *data, size_t len) {
    uint32_t crc = 0xFFFFFFFF;
    while (len--) {
        crc ^= *data++;                  // XOR byte into low 8 bits
        for (int i = 0; i < 8; i++) {
            if (crc & 1)
                crc = (crc >> 1) ^ 0xEDB88320;  // LSB set: shift and XOR poly
            else
                crc >>= 1;                        // LSB clear: just shift
        }
    }
    return ~crc;                         // final XOR with 0xFFFFFFFF
}
// Usage: if (crc32(image, size) == stored_crc) → image valid
\`\`\`

**Common interview trap:** Know the difference between LSB-first (right-shift, poly 0xEDB88320) and MSB-first (left-shift, poly 0x04C11DB7). Most embedded bootloaders use LSB-first to match hardware CRC peripherals.

## LDMA Ping-Pong: Write from Memory

\`\`\`c
// Descriptor setup — two linked descriptors form the ping-pong ring
static LDMA_Descriptor_t dma_desc[2];
static int32_t rx_buf_a[256], rx_buf_b[256];

void audio_ldma_init(void) {
    // Descriptor A: USART1 RX → bufA, then link to descriptor B
    dma_desc[0] = (LDMA_Descriptor_t)
        LDMA_DESCRIPTOR_LINKREL_P2M_WORD(&USART1->RXDATA, rx_buf_a, 256, +1);
    // link offset +1 = point to dma_desc[1]

    // Descriptor B: USART1 RX → bufB, then link BACK to descriptor A
    dma_desc[1] = (LDMA_Descriptor_t)
        LDMA_DESCRIPTOR_LINKREL_P2M_WORD(&USART1->RXDATA, rx_buf_b, 256, -1);
    // link offset -1 = point back to dma_desc[0]
    // Both descriptors have DONEIEN=1 (set by LINKREL macro)

    LDMA_TransferCfg_t cfg =
        LDMA_TRANSFER_CFG_PERIPHERAL(ldmaPeripheralSignal_USART1_RXDATAV);

    LDMA_StartTransfer(DMA_CHANNEL_AUDIO, &cfg, &dma_desc[0]);
}

void LDMA_IRQHandler(void) {
    uint32_t flags = LDMA_IntGet();
    LDMA_IntClear(flags);

    if (flags & (1 << DMA_CHANNEL_AUDIO)) {
        // Determine which buffer just completed
        // If LDMA->CH[ch].DST points into buf_b, buf_a just completed
        bool buf_a_done = (LDMA->CH[DMA_CHANNEL_AUDIO].DST ==
                          (uint32_t)rx_buf_b);  // now filling B = A done
        int32_t *completed = buf_a_done ? rx_buf_a : rx_buf_b;

        BaseType_t woken = pdFALSE;
        xQueueSendFromISR(audio_queue, &completed, &woken);
        portYIELD_FROM_ISR(woken);
    }
}
\`\`\`

## SPH0645 Sign-Extension: Write from Memory

\`\`\`c
// SPH0645 outputs 18-bit audio in bits [31:14] of a 32-bit I2S word
// Raw from DMA: uint32_t raw32

// Step 1: shift right 14 to align to bits [17:0]
int32_t sample = (int32_t)(raw32 >> 14);

// Step 2: sign-extend from 18 bits to 32 bits
// Bit 17 is the sign bit of the 18-bit value
if (sample & (1 << 17)) {
    sample |= ~((1 << 18) - 1);  // fill upper 14 bits with 1s
}
// Now: sample is a proper signed int32_t in range [-131072, +131071]
\`\`\`

## Practice Timing Goals

\`\`\`diagram
CRC32 from scratch:          target 10 min (practice until <10 min)
LDMA ping-pong descriptors:  target 15 min
I2C 9-pulse recovery:        target 10 min
Sign-extend from I2S raw:    target 3 min

If slower than target: close notes, write on paper, compare, repeat.
Fluency = no hesitation on structure, only thinking about edge cases.
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'STAR Framework — Behavioral Interview Structure',
            content: `## The STAR Structure

Every behavioral answer must have all four parts. Missing any part weakens the answer.

\`\`\`diagram
S — Situation:  1-2 sentences of specific context
                Who, where, when, what the environment was
                BAD: "I worked on a battery project"
                GOOD: "At Lucid Motors, 3 weeks before BMS certification..."

T — Task:       YOUR specific responsibility (not the team's)
                "I was responsible for the cell monitoring ASIC firmware driver"
                Shows scope: what did YOU own?

A — Action:     Most important section. 3-5 concrete steps YOU took.
                Use "I" not "we". Technical terms. Specific tools.
                "I profiled with DWT → found CAN polling at 78% CPU →
                 replaced with interrupt-driven RX FIFO → 12× reduction"

R — Result:     QUANTIFIED outcome. Numbers matter.
                "Latency: 23ms → 4ms"
                "Certification passed first attempt (saved 6-week retest)"
                "Patent filed — I am listed as first inventor"
\`\`\`

## 5 Stories to Prepare

\`\`\`diagram
Story 1 — Technical achievement (EFR32BG13 project):
  S: Needed transparency mode firmware under 20ms latency
  T: Architect and implement entire firmware stack solo
  A: Chose ping-pong DMA (62 IRQ/s vs 32K), FreeRTOS 5-task design,
     DWT benchmarking, adaptive gain, wind detection
  R: 17ms latency, 8hr battery, wind detection 93% on test corpus

Story 2 — Innovation (Lucid Motors BMS patent):
  S: Cell monitoring ASIC had no published SPI protocol spec
  T: Reverse-engineer and implement production-grade driver
  A: Logic analyzer capture, iterative testing, wrote abstraction layer
  R: Filed patent as first inventor; driver shipped in production BMS

Story 3 — Technical decision under uncertainty (ping-pong vs circular):
  S: USART1 I2S behavior undefined in EFR32BG13 datasheet for our config
  T: Choose DMA strategy with deadline 1 week out
  A: Built minimal test harness, tried 4 CLKDIV values, found stable config,
     validated with 24hr soak test, documented findings
  R: Shipped on time; filed bug report with Silicon Labs

Story 4 — Prioritization under pressure:
  S: Two critical deliverables due same week
  T: Communicate priority to manager and stakeholder
  A: Enumerated risk of each, proposed phased delivery, aligned stakeholders
  R: Higher-risk item shipped on time; lower shipped 1 week late with agreement

Story 5 — Cross-functional collaboration (mic bias issue):
  S: Audio quality poor; unclear if hardware or software issue
  T: Isolate root cause collaboratively with hardware engineer
  A: I wrote diagnostic firmware logging raw I2S samples;
     HW engineer probed mic bias circuit; found bias 200mV low
  R: Hardware fix in rev B; software workaround for rev A units in field
\`\`\`

## Common Behavioral Pitfalls

\`\`\`
1. Saying "we" → interviewer can't assess YOUR contribution
   Fix: "I designed X; my colleague handled Y"

2. Un-quantified result: "it worked better"
   Fix: "latency went from 23ms to 4ms" or "saves 6-week retest cycle"

3. Over 3 minutes: interviewer mentally disengages
   Fix: Record yourself, time it, cut to 3 min ruthlessly

4. "Tell me about yourself" rambling
   Fix: Current role (10s) → relevant past (20s) → why Apple (20s) →
        one sentence on EFR32BG13 project (15s) → done in 65 seconds
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Apple Interview Process & Structure',
            content: `## The Typical Apple Firmware Interview Pipeline

\`\`\`diagram
Stage 1: Recruiter screen (30 min)
  → Resume review, salary range discussion, background check
  → Usually no technical questions — prepare "tell me about yourself"

Stage 2: Technical phone screen (60 min)
  → Live coding or verbal technical questions
  → Expect: interrupt handling, DMA, RTOS basics, one coding question
  → This is the filter: 50% of candidates drop here

Stage 3: On-site (4-6 rounds × 45-60 min each)
  ┌─ Round 1: Technical deep-dive (register level, debug scenarios)
  ├─ Round 2: Technical deep-dive (firmware architecture, coding)
  ├─ Round 3: System design (whiteboard, open-ended)
  ├─ Round 4: Project presentation + Q&A  ← most important
  └─ Round 5-6: Behavioral (1-2 rounds)
\`\`\`

## Project Round: The Most Critical

\`\`\`diagram
Structure (45 min total):
  Minutes 0-5:   Overview — what does the project do?
  Minutes 5-15:  Architecture walkthrough — draw the system
  Minutes 15-25: Deep Q&A — hardest questions here:
    "Why ping-pong DMA vs circular?"
    "What would you do differently?"
    "Walk me through your hardest bug"
    "What are the limitations vs real AirPods?"
  Minutes 25-35: Variations — "how would you add ANC?"
  Minutes 35-45: Your questions for them

Preparation rule: For EVERY design decision, know:
  (1) What the alternatives were
  (2) Why you chose this approach (measured, not intuition)
  (3) What the tradeoffs are
\`\`\`

## What Apple Looks for in Each Round

| Round | What They're Testing |
|-------|---------------------|
| Technical | Can you think at register level? Can you debug under pressure? |
| System Design | Do you consider power, security, failure modes? Do you quantify? |
| Project | Did you really build it? Can you defend every decision? |
| Behavioral | Apple values: craftsmanship, ownership, collaboration |

## How to Handle "I Don't Know"

\`\`\`
WRONG: "I don't know." (full stop)
  → Signals you stop thinking under pressure

RIGHT: "I don't know the exact answer, but reasoning from what I do know:
        [structured reasoning toward an answer]
        I'd want to verify this by [reading specific TRM section / testing]."
  → Shows engineering mindset: reason from first principles, identify gaps

Example: "I don't know the exact AIRCR.BFHFNMINS bit position off the top
of my head, but I know it controls whether bus faults target the secure
or non-secure world in TrustZone. I'd look it up in the ARMv8-M TRM §B3.5."
\`\`\`

## Apple Values to Demonstrate

\`\`\`
Craftsmanship: "I measured it — 17ms, not 'fast enough'"
               Show you care about exact numbers, not approximations

Customer obsession: "This matters because a 17ms latency is inaudible
                    to humans (JND is ~30ms), so the user experience..."
                    Connect every decision back to user impact

Collaboration: STAR stories showing cross-functional work
               "I worked with the HW team to isolate the mic bias issue"
               Interviewers check your communication, not just your code
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Questions to Ask Apple — By Round Type',
            content: `## Why Asking Good Questions Matters

Your questions signal what you care about and how you think. A question about the real-time constraints shows you understand their engineering problems. A question about PTO signals you prioritize compensation over craft.

Interviewers compare notes. Never repeat the same question across rounds — they will notice.

## Questions by Round Type

\`\`\`diagram
Technical Rounds (show you understand their hard problems):
  "What is the hardest real-time constraint in your audio pipeline
   today, and how does the firmware manage it?"

  "How does the firmware coordinate with the H-series dedicated DSP
   cores — shared memory, mailbox, or something else?"

  "What is the biggest source of audio latency variance you see
   in production hardware vs development boards?"

System Design Round (show you think like a platform engineer):
  "How do you approach firmware bring-up when a new SoC revision
   has undocumented register changes?"

  "How does HIL (hardware-in-loop) regression testing work for
   AirPods — do you emulate the acoustic path?"

  "What was the biggest architectural decision that shaped the
   current generation's firmware?"
\`\`\`

\`\`\`diagram
Project Round (show you want to learn their craft):
  "What does firmware onboarding look like for a new engineer —
   how long before you're making meaningful contributions?"

  "How much firmware is shared between AirPods, Apple Watch, and
   Beats vs device-specific? How do you manage that divergence?"

Behavioral Round (show long-term thinking):
  "What does the career growth path look like for a firmware engineer
   beyond senior level at Apple?"

  "How does your team handle technical disagreements between
   firmware and silicon design teams?"
\`\`\`

## Questions to NEVER Ask

\`\`\`
Never ask: salary, PTO, work hours, remote/hybrid policy, stock options
  → These are recruiter-phase questions
  → Asking them in technical rounds signals you're thinking about
     compensation, not the craft

Never ask generic questions:
  BAD:  "What does Apple's culture look like?"
  GOOD: "How does your team's firmware review process handle
         decisions that span hardware and software?"
\`\`\`

## Closing Every Round

At the end of every round, ask:

> "Is there anything about my background or my answers today that I should clarify or that you'd like me to elaborate on?"

This invites the interviewer to surface doubts while you're still in the room — and gives you a chance to address them directly. Most candidates never ask this.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Cortex-M33 vs M4F — Key Additions',
            content: `## What Transfers Directly from M4F (95%)

\`\`\`diagram
These are IDENTICAL between M4F and M33:

  NVIC          — same register layout (ISER, ICER, IPR, etc.)
  SysTick       — same CTRL/LOAD/VAL registers
  PendSV        — same mechanism, same trick for context switch
  DWT           — same CYCCNT, same watchpoint registers
  ITM           — same 32 stimulus ports at 0xE0000000
  FPU           — single-precision FPU, same FPCCR/FPCAR/FPDSCR
  Fault regs    — CFSR, HFSR, MMFAR, BFAR at same addresses
  Exception model — same 12-cycle latency, same frame layout
  Thumb-2 ISA   — compatible (M33 adds some DSP extensions)
\`\`\`

## The Three New Things in M33

\`\`\`diagram
Addition 1: TrustZone-M

M4F: Single security domain. All code sees all memory.
M33: Hardware partitions address space:
  ┌──────────────────────────────────────────┐
  │  Secure (S) region                       │
  │  (bootloader, crypto keys, attestation)  │
  ├──────────────────────────────────────────┤
  │  Non-Secure (NS) region                  │
  │  (application, BLE stack, user code)     │
  ├──────────────────────────────────────────┤
  │  Non-Secure Callable (NSC) region        │
  │  (veneers — only valid NS→S entry point) │
  └──────────────────────────────────────────┘

Addition 2: 16-region MPU (vs 8 in M4F)
  More regions = finer-grained access control
  Useful: protect bootloader flash, DMA buffers, peripheral space

Addition 3: 4 stack pointers (vs 2 in M4F)
  M4F: MSP (handler/privileged) + PSP (tasks)
  M33: Secure-MSP + Secure-PSP + NS-MSP + NS-PSP
  → Secure world has its own completely separate stacks
\`\`\`

## SAU: Security Attribution Unit

\`\`\`c
// Configure SAU regions (M33 specific):
SAU->RNR  = 0;                          // select region 0
SAU->RBAR = 0x10000000;                 // base address
SAU->RLAR = 0x1001FFFE | SAU_RLAR_ENABLE_Msk;  // limit + enable
// Region 0: Secure (default if no SAU region covers it)

SAU->RNR  = 1;
SAU->RBAR = 0x20000000;
SAU->RLAR = 0x2001FFFE | SAU_RLAR_ENABLE_Msk | SAU_RLAR_NSC_Msk;
// Region 1: Non-Secure Callable (NSC veneer region)

SAU->CTRL = SAU_CTRL_ENABLE_Msk;       // enable SAU
// Anything not covered by SAU: defaults to Secure
\`\`\`

## AIRCR.BFHFNMINS Bit

\`\`\`diagram
AIRCR.BFHFNMINS controls fault target security state:

BFHFNMINS = 0 (default):
  BusFault, HardFault, NMI target → Secure world
  If Non-Secure code causes a bus fault: escalates to Secure HardFault

BFHFNMINS = 1:
  Those faults can target Non-Secure world
  Useful when NS code handles its own faults without Secure involvement
\`\`\`

## Interview Answer: Bridging M4F → Apple Silicon

> "My M4F knowledge transfers 95% directly. NVIC, PendSV, DWT, fault registers — identical. M33 adds TrustZone (SAU partitioning) and 16-region MPU. I'd spend Week 1 on SAU setup and the new stack pointer model. The DSP SDK and audio pipeline would be the real learning curve, but the firmware patterns — RTOS, DMA, ISR hierarchy — I know cold."`,
          },
        ],
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
        readingNotes: [
          {
            source: 'TrustZone-M Deep Dive & Apple Secure Boot',
            content: `## TrustZone-M: Hardware Security Partitioning

\`\`\`diagram
Single physical ARM M33 processor:

          ┌────────────────────────────────────┐
          │          Secure World              │
          │  bootloader, crypto keys, attestation│
          │  can access ALL memory             │
          │                                    │
          ├── NSC veneers (only valid S entry) ─┤
          │                                    │
          │          Non-Secure World          │
          │  application code, BLE stack       │
          │  can ONLY access NS-marked memory  │
          │  attempt to access S memory →      │
          │  SecureFault exception             │
          └────────────────────────────────────┘

Key: Both worlds run on SAME core. Security is software-configured
     via SAU registers (+ IDAU for implementation-defined regions).
\`\`\`

## NSC (Non-Secure Callable) Veneers

\`\`\`diagram
The entry control problem: NS code needs to call Secure functions.
But we can't let NS code jump to arbitrary Secure addresses.

Solution: NSC region contains ONLY veneer stubs that switch state:

NS code:         BLXNS secure_api_veneer   ← the only valid entry
NSC region:      secure_api_veneer:
                     SG                   ← "Secure Gate" instruction
                     B.W  actual_impl     ← jump into Secure code
Secure code:         actual_impl:
                     ... (full Secure access)
                     BXNS LR              ← return to NS

Any NS branch to Secure address NOT through NSC → SecureFault ✓
\`\`\`

## SAU vs MPU: Complementary Layers

\`\`\`diagram
SAU (Security Attribution Unit):
  Controls WHICH addresses are Secure vs Non-Secure
  8 programmable regions
  "This address range is NS" or "this is NSC"

MPU (Memory Protection Unit):
  Controls read/write/execute permissions
  16 regions in M33 (vs 8 in M4F)
  "This NS address range is read-only for NS code"

Both are needed:
  SAU alone: NS code can write to any NS memory (no permission control)
  MPU alone: no Secure/NS partitioning
  Together: full security + memory isolation
\`\`\`

## Apple Secure Boot Chain

\`\`\`diagram
Apple's boot chain — every step ECDSA-verified:

Boot ROM (on-chip, immutable, burned at fab)
     │
     │ ECDSA verify with burned-in root key
     ▼
LLB (Low Level Bootloader) — stored in NOR flash
     │
     │ ECDSA verify with Apple CA chain
     ▼
iBoot — initializes DRAM, loads kernel
     │
     │ ECDSA verify
     ▼
XNU Kernel — iOS/macOS kernel
     │
     ▼
Trusted apps, codesigned binaries only

Anti-rollback: hardware fuses burned per security version.
Each iBoot version increments fuse counter. Cannot downgrade.
Identical in concept to our EFR32BG13 monotonic counter OTA scheme.
\`\`\`

## Apple Secure Enclave (SEP): Separate Die

\`\`\`diagram
Main SoC (A/H-series):                 Secure Enclave Processor (SEP):
┌──────────────────────┐               ┌──────────────────────┐
│  Application CPU     │               │  Dedicated ARM core  │
│  Neural Engine       │◄──mailbox────►│  Face ID templates   │
│  GPU                 │               │  Apple Pay keys      │
│  BLE/WiFi            │               │  Device encryption   │
│                      │               │  Touch ID data       │
│  Even if COMPROMISED │               │  Remains ISOLATED ✓  │
└──────────────────────┘               └──────────────────────┘

Why separate die? TrustZone limitation: SAU is configured in software.
A kernel exploit could misconfigure SAU and bypass TrustZone.
SEP has its own ROM, RAM, crypto accelerators — completely separate.
Main CPU cannot access SEP memory even with full kernel privilege.
\`\`\`

## TrustZone Limitations to Know

\`\`\`
1. Software-configured → SAU misconfiguration = full bypass
   (This is why Apple uses separate SEP for highest security assets)

2. DMA bypass: DMA engines are non-secure by default
   Must configure IDAU/SAU to mark DMA targets as appropriate
   Missing this = DMA can read Secure memory from NS context

3. Side-channel attacks: cache timing, power analysis
   Can leak Secure data even with correct SAU configuration
   Requires constant-time implementations for crypto
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Advanced Power — DVFS, Retention SRAM & Clock Crossing',
            content: `## CMOS Power: The Physics

**Total power = Dynamic + Static**

\`\`\`diagram
Dynamic power (switching):
  P_dyn = C_load × V_DD² × f × α

  C_load = total switching capacitance (design constant)
  V_DD   = supply voltage  (huge lever — squared!)
  f      = clock frequency (linear lever)
  α      = activity factor (fraction of gates switching per cycle)

Static power (leakage):
  P_static = V_DD × I_leak  (exponentially worse at high V and temperature)

Key insight: V is squared → reducing V is the most powerful lever.
\`\`\`

## DVFS in Practice

\`\`\`diagram
Apple A-series example (illustrative):
  Max performance: 3.0 GHz @ 1.1V

  Halve frequency + reduce voltage:
  1.5 GHz @ 0.8V

  P_ratio = (0.8/1.1)² × (1.5/3.0)
           = 0.529    × 0.5
           = 0.265
           = 26% of original power!  (3.8× reduction)

The voltage term dominates because it's squared.
\`\`\`

\`\`\`diagram
Transition sequence — order matters for reliability:

Increasing performance:           Decreasing performance:
  1. Raise voltage FIRST            1. Lower frequency FIRST
     (PMIC, wait ~100µs)               (CMU/PLL switch)
  2. Then raise frequency           2. Then lower voltage
                                       (PMIC)

Wrong order (raise freq before voltage):
  → CPU running at higher frequency than supply can support
  → timing violations → data corruption → silent bug
\`\`\`

## Retention SRAM: Keep State Through Deep Sleep

\`\`\`diagram
Normal SRAM:          SRAM in retention:
  VDD = 1.8V            VDD = 0.7V (retention voltage)
  Active read/write     Read/write DISABLED
  Full speed            State preserved with minimal leakage
  I_leak = baseline     I_leak ≈ baseline / 4

Use case: FreeRTOS heap, audio buffers, BLE bonding data
  → Keep alive through EM2/EM3 → wake up and continue

EFR32BG13: SRAM banks can be selectively retained.
  Power-gate unused banks: EMU_RamPowerDown(EMU_RAMPOWERDOWN_...)
  Retain needed banks: leave powered, they go to retention voltage
\`\`\`

## Clock Domain Crossing (CDC): The Metastability Problem

\`\`\`diagram
Two clock domains at different frequencies:

Clock A (HFXO 38.4 MHz):   ╱╲╱╲╱╲╱╲╱╲╱╲╱╲
Clock B (LFXO 32.768 kHz): ╱────────────╲─

Signal crossing A → B:
  Data changes in clock A domain.
  Clock B samples the signal.
  If data changes too close to clock B's rising edge → METASTABILITY:
    Flip-flop output is neither 0 nor 1 for ~100-500ps
    Usually resolves, but not guaranteed
    Probability: P_fail ≈ e^(-t_resolve / τ)  where τ ≈ 100ps
\`\`\`

\`\`\`diagram
CDC Solutions:

Single-bit signal (e.g., interrupt flag):
  2-flip-flop synchronizer:
  [FF1 clocked by B] → [FF2 clocked by B] → stable signal in B domain
  Adds 2 cycles of latency (acceptable for slow flags)

Multi-bit data (e.g., 32-bit counter):
  Problem: bits may be sampled in different metastable states
  Solution: handshake protocol (req/ack across synchronizers)
  Or: Gray code encoding (only 1 bit changes per increment)

Data stream (e.g., audio samples):
  Async FIFO with Gray-coded read/write pointers
  Producer writes in domain A, consumer reads in domain B
  Gray code pointers safely cross domains
\`\`\`

**Firmware implication:** In our project — audio at 1.024 MHz BCLK, BLE at its own RF clock. The hardware peripherals (USART, RADIO) handle the CDC internally. But if you ever read a hardware counter from a different clock domain in firmware: read it twice, check if values match, retry if not (software polling synchronizer).`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Multi-Core Firmware — Shared Memory & Synchronization',
            content: `## Modern Wearable SoC: Multiple Cores

\`\`\`diagram
Apple H-series SoC (conceptual):

┌──────────────────────────────────────────────────────┐
│  Application core (ARM Cortex-A/M)                   │
│  BLE controller (ARM Cortex-M0)                      │
│  DSP cores ×2 (dedicated ANC/audio hardware)         │
│  Sensor hub (low-power Cortex-M0)                    │
│                                                      │
│  Shared SRAM bank ◄─── all cores can access          │
│  Mailbox registers ◄─── inter-core signaling         │
└──────────────────────────────────────────────────────┘

EFR32BG13: single Cortex-M4F (simple — single bus master)
Apple platform: multi-core — all the complexity below applies
\`\`\`

## Shared SRAM: Cache Coherency

\`\`\`diagram
Option A: Non-cacheable shared region (simplest)

  Application core MPU: shared_sram region = Normal, Non-cacheable
  All accesses bypass cache → always reads SRAM directly

  Pros: automatically coherent
  Cons: slower (no L1 cache benefit), higher bandwidth usage

Option B: Cached + explicit maintenance

  Core A (producer):
    write data → data in L1 cache
    SCB_CleanDCache_by_Addr(buf, len)   ← flush to SRAM
    set_flag(READY)                      ← signal Core B
    __DMB()                              ← ensure flag visible after data!

  Core B (consumer):
    poll_flag() == READY
    SCB_InvalidateDCache_by_Addr(buf, len)  ← discard stale cache
    read data                                ← now reads from SRAM

  Pros: performance (cache benefits outside shared region)
  Cons: error-prone, EVERY code path must follow the discipline
\`\`\`

## __DMB(): Why Memory Barriers Matter

\`\`\`c
// WRONG — without memory barrier:
void produce(uint8_t *buf, size_t len) {
    memcpy(shared_buf, buf, len);   // (1) write data
    flag = READY;                    // (2) signal consumer
}
// Problem: ARM write buffer may reorder these!
// Consumer may see flag=READY before data is actually in SRAM.

// CORRECT — with memory barrier:
void produce(uint8_t *buf, size_t len) {
    memcpy(shared_buf, buf, len);   // (1) write data
    __DMB();                         // (2) ensure all writes complete
    flag = READY;                    // (3) THEN set flag
}
// __DMB() prevents write buffer reordering across the barrier.
// Consumer sees flag=READY ONLY AFTER data is committed to SRAM.
\`\`\`

## Mailbox: Core-to-Core Interrupt Signaling

\`\`\`diagram
Mailbox mechanism (hardware doorbell):

Core A (audio DSP):
  1. Write processed frame pointer to MAILBOX_DATA_REG
  2. Write 1 to MAILBOX_SET_REG  ← triggers IRQ on Core B

Core B (application core):
  3. MAILBOX_IRQHandler fires
  4. Read MAILBOX_DATA_REG → get frame pointer
  5. Process frame
  6. Write to MAILBOX_CLR_REG ← clears IRQ

All mailbox registers are in non-cacheable hardware register space
→ no cache coherency issue for the signaling itself
\`\`\`

## Lock-Free Ring Buffer (Single Producer, Single Consumer)

\`\`\`c
// Safe across cores when producer owns write_idx, consumer owns read_idx
typedef struct {
    volatile uint32_t write_idx;   // written only by producer
    volatile uint32_t read_idx;    // written only by consumer
    uint32_t *buf;
    uint32_t size;
} ring_buf_t;

bool ring_push(ring_buf_t *r, uint32_t val) {
    uint32_t next = (r->write_idx + 1) % r->size;
    if (next == r->read_idx) return false;  // full
    r->buf[r->write_idx] = val;
    __DMB();                  // ensure data written before index
    r->write_idx = next;      // consumer sees updated index only after data
    return true;
}

bool ring_pop(ring_buf_t *r, uint32_t *val) {
    if (r->read_idx == r->write_idx) return false;  // empty
    *val = r->buf[r->read_idx];
    __DMB();
    r->read_idx = (r->read_idx + 1) % r->size;
    return true;
}
// No mutex needed: one producer writes write_idx, one consumer writes read_idx
// Each side only reads the other's index (single-writer rule)
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Week 10 Self-Assessment — Cold Test Topics',
            content: `## Self-Assessment: Close Notes, Answer from Memory

These 6 tests are your readiness check. Do them cold — no notes, no looking back.

## Test 1: LDMA Ping-Pong from Memory (target: <3 min)

Draw on paper: two descriptor structs with link fields, channel config, peripheral signal, IRQ handler posting to queue. If you hesitate on the link offset direction or the queue API, revisit W3D1.

## Test 2: CFSR Decode (target: <60 sec)

\`\`\`diagram
CFSR = 0x00008200

UFSR [31:16] = 0x0000 — no usage fault
BFSR [15:8]  = 0x82   = 0b10000010
  bit 15 (BFARVALID) = 1  → BFAR register contains valid address
  bit  9 (PRECISERR) = 1  → precise bus fault (synchronous address error)

Conclusion:
  Precise bus fault. Check BFAR for the faulting address.
  Find faulting PC at exception_frame[6] (read PSP if task, MSP if ISR).
  Common cause: NULL pointer dereference or unmapped peripheral access.
\`\`\`

## Test 3: Why No EM3 with BLE? (target: <30 sec)

\`\`\`diagram
Energy modes and oscillators:

EM0/EM1/EM2: HFXO or HFRCO active → LFXO running
  LFXO: ±20 ppm → BLE connection timing requirement: ±50 ppm ✓

EM3: LFXO STOPPED. Only ULFRCO available.
  ULFRCO: ±2% = ±20,000 ppm
  BLE requirement: ±50 ppm
  ULFRCO error: 400× too large → BLE connection interval drift → disconnect

Therefore: must stay in EM2 (or shallower) while BLE connection active.
\`\`\`

## Test 4: EXC_RETURN bit[2]? (target: <60 sec)

\`\`\`diagram
EXC_RETURN bit[2] = SPSEL:
  1 → PSP was the active stack (task context — FreeRTOS task)
  0 → MSP was the active stack (handler/privileged context)

In FreeRTOS:
  Tasks run with PSP → HardFault from task → bit[2]=1
  To get faulting PC: read PSP, then frame[6]
  NOT MSP — MSP points to the OS stack, not the crashed task's stack
\`\`\`

## Test 5: M33 Adds vs M4F? (target: <45 sec)

Three additions:
1. **TrustZone-M (SAU)** — hardware Secure/Non-Secure partitioning
2. **16-region MPU** — vs 8 in M4F
3. **4 stack pointers** — Secure-MSP, Secure-PSP, NS-MSP, NS-PSP

## Test 6: Full Audio Frame Path (target: <90 sec)

\`\`\`diagram
Sound → SPH0645 MEMS mic → I2S bus (BCLK 1.024MHz, LRCK 16kHz)
  → USART1 RX FIFO → LDMA (256-word transfer)
  → rx_buf_A or rx_buf_B → LDMA IRQ fires
  → xQueueSendFromISR(buf_ptr) → MicSampler task unblocks
  → raw32 >> 14 + sign-extend 18-bit
  → xQueueSend to AudioProcessor
  → arm_rms_f32 (gain calculation) + arm_rfft_fast_f32 (wind detection)
  → arm_scale_f32 (apply gain) → TX DMA → I2S TX → MAX98357A → speaker

Total: 17ms latency | 62.5 IRQ/sec | 256 samples @ 16kHz = 16ms frame
\`\`\`

**Pass criteria:** Answer all 6 cleanly, without notes, in under 3 minutes each → you are ready for Apple.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Mock Round 1 — FreeRTOS Hook Functions & DMA Arbitration',
            content: `## Tick Hook vs Idle Hook: Key Difference

\`\`\`diagram
vApplicationTickHook():
  Called from: SysTick ISR (xTaskIncrementTick)
  Context: INTERRUPT — this is an ISR!
  Constraints:
    ✗ No blocking FreeRTOS APIs (no vTaskDelay, no xQueueReceive)
    ✗ No task APIs — only *FromISR variants
    ✓ Must be FAST (microseconds, not milliseconds)
  Use: increment debug timestamp, toggle GPIO for scope probe

vApplicationIdleHook():
  Called from: Idle TASK (lowest priority, runs when nothing else can)
  Context: TASK — full task context, not ISR
  Constraints:
    ✗ Must not BLOCK (Idle task must remain runnable)
    ✓ Can call task APIs that yield but don't block
    ✓ Can call EMU_EnterEM2(true) — MCU sleeps until next interrupt
  Use: enter EM2 sleep, collect background statistics
\`\`\`

\`\`\`c
// Enable in FreeRTOSConfig.h:
#define configUSE_TICK_HOOK   1
#define configUSE_IDLE_HOOK   1

// Tick hook — ISR context, fast only
void vApplicationTickHook(void) {
    debug_tick_count++;                    // atomic uint32 increment OK
    // GPIO toggle for scope: GPIO_PinOutToggle(gpioPortA, 5);
}

// Idle hook — task context, enter EM2
void vApplicationIdleHook(void) {
    GPIO_PinOutSet(gpioPortB, 0);         // PB0 high = sleeping
    EMU_EnterEM2(true);                   // sleep until next interrupt
    GPIO_PinOutClear(gpioPortB, 0);       // PB0 low = woke up
    // DO NOT call vTaskDelay or any blocking API here!
}
\`\`\`

## Adding Stereo: What Changes

\`\`\`diagram
Mono system (current):
  USART1 I2S ──► LDMA ch0 ──► buf_a/b ──► IRQ ──► queue ──► AudioProcessor

Stereo (two mics):
  USART1 I2S (L) ──► LDMA ch0 ──► L_buf_a/b ──► IRQ ──► L_queue ──┐
  USART2 I2S (R) ──► LDMA ch1 ──► R_buf_a/b ──► IRQ ──► R_queue ──┼──► AudioProcessor
                                                                    │
  AudioProcessor: wait for BOTH queues, interleave L+R per frame ──┘

Coherency: both DMA channels triggered by same LRCK signal
  → they start simultaneously → L and R samples aligned ✓
\`\`\`

## DMA Bus Arbitration

\`\`\`diagram
AHB bus bandwidth: 38.4 MHz × 4 bytes = 153.6 MB/s

Audio DMA usage (stereo):
  16,000 samples/sec × 4 bytes × 2 channels = 128 KB/s

Utilization: 128 KB/s / 153,600 KB/s = 0.08% — negligible!

Even at 48kHz stereo 32-bit:
  48,000 × 4 × 2 = 384 KB/s = 0.25% — still negligible

DMA arbitration: EFR32BG13 LDMA uses round-robin between channels
  (configurable per-channel priority).
  With 2 audio channels: each gets bus every other cycle when both active.
  No bandwidth contention at these sample rates.
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Mock Round 2 — TWS System Design: All 8 Dimensions',
            content: `## System Design: TWS Earbuds (ANC + HR + BLE)

Answer format: State dimensions out loud, draw blocks, add numbers. Never skip power or failure modes — Apple always asks.

## Dimension 1: Requirements

\`\`\`diagram
Functional:
  - ANC (feedforward + feedback hybrid)
  - Transparency mode (pass-through audio)
  - HR monitoring (PPG optical sensor)
  - BLE (iOS pairing, audio streaming, HR data)
  - TWS (left + right independent MCUs)

Non-functional:
  - Battery: 50mAh, target 1 day active use
  - ANC latency: <0.5ms (bare-metal requirement)
  - Audio latency: <20ms transparency (RTOS ok)
  - HR accuracy: ±5 BPM
\`\`\`

## Dimension 2: Hardware Block Diagram

\`\`\`diagram
┌─────────────────────────────────────────────────┐
│  Custom ARM SoC + DSP                           │
│  ┌────────┐  ┌────────┐  ┌──────────────────┐  │
│  │FF mic  │  │FB mic  │  │Transparency mic  │  │
│  │(outer) │  │(inner) │  │(outer, pass-thru)│  │
│  └────────┘  └────────┘  └──────────────────┘  │
│       │           │                 │           │
│  ┌────▼───────────▼─────────────────▼────────┐  │
│  │        ANC DSP (bare-metal ISR)            │  │
│  │        ARM application core (FreeRTOS)     │  │
│  └────────────────────────────────────────────┘  │
│       │                     │                    │
│  Speaker               HR sensor (PPG+accel)    │
│  PMIC                  BLE antenna               │
│  Inter-earbud link (2.4GHz or NFMI)             │
└─────────────────────────────────────────────────┘
\`\`\`

## Dimension 3: Task Architecture

\`\`\`diagram
Priority (high to low):
  IRQ: ANC DSP (bare-metal, 48kHz, <20µs budget, NO RTOS)
  P10: TransparencyDSP (FreeRTOS, 16ms frame, pass-through)
  P8:  BLEManager (event-driven, handles connection events)
  P6:  HRTask (1Hz, PPG sample + algorithm)
  P4:  WatchdogPetter (bitmask from all tasks, 500ms period)
  P1:  Idle (EMU_EnterEM2)

Key: ANC CANNOT be a FreeRTOS task — 0.5ms < RTOS scheduling jitter
     ANC must be a bare-metal ISR at highest priority
\`\`\`

## Dimension 4: Power Budget (50mAh)

\`\`\`diagram
1-day target: 50mAh / 24h = 2.08 mA average

Active mode (music + ANC, 6h/day):
  ANC DSP active:     3.0 mA
  BLE streaming:      1.5 mA
  Speaker (class D):  2.5 mA
  HR sensor:          0.5 mA
  Total active:       7.5 mA × 6h = 45 mAh

Idle/sleep (18h/day):
  EM2 + BLE conn events only: ~100 µA × 18h = 1.8 mAh

Total: 46.8 mAh < 50mAh ✓ (barely — optimize ANC DSP clock)
\`\`\`

## Dimension 5: Memory Layout

\`\`\`diagram
Flash (512KB):
  [Bootloader 32KB][App A 240KB][App B 240KB (OTA)]

SRAM (256KB):
  [ANC buffers 8KB non-cacheable]
  [Transparency buffers 4KB non-cacheable]
  [BLE stack 32KB]
  [FreeRTOS heap 48KB]
  [HR buffers 4KB]
  [Stack: ISR 4KB, each task 4KB]
\`\`\`

## Dimensions 6-8: Security, Failure Modes, Data Flow

\`\`\`
Security:
  OTA: ECDSA-P256 signed images (private key never leaves build server)
  BLE pairing: bonding with LTK stored in NVM3
  HR data: stays on device only — never transmitted via BLE (privacy)

Failure modes:
  ANC malfunction → ISR exception → reset ANC, fallback to transparency
  HR sensor I2C lockup → 9-pulse recovery → if still fails, disable HR
  Power fault → PMIC IRQ → ordered shutdown (signals first, then rails)
  Crash loop → boot counter ≥ 3 → revert OTA to previous image

Data flow:
  ANC: mic ADC → ISR → FxLMS filter → DAC (0 FreeRTOS involvement)
  Transparency: I2S → LDMA → queue → task → gain → I2S TX
  HR: I2C PPG → task → algorithm → BLE GATT notification (if app open)
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Mock Round 3 — Project Deep Dive Prep',
            content: `## Opening Statement (2 minutes)

Memorize this and deliver it naturally — it sets the frame for every question that follows:

> "I built a real-time audio transparency mode on the EFR32BG13 — a Cortex-M4F with BLE. A MEMS microphone captures audio via I2S. LDMA ping-pong descriptors transfer 256-sample blocks every 16ms without CPU involvement. FreeRTOS tasks handle DSP — RMS-based adaptive gain, FFT-based wind detection — and play back through a MAX98357A I2S amplifier. BLE lets an iOS app control gain, mode, and streaming. End-to-end latency: 17ms. Battery: 8 hours."

## Decision Rationale You Must Know Cold

\`\`\`diagram
Decision 1: Ping-pong DMA vs circular DMA

Circular DMA: continuous ring buffer, no interrupts per completion.
  Problem: How do you know when 256 samples are ready?
  Option A: Poll buffer half-full flag — burns CPU cycles, unpredictable timing
  Option B: DMA half-complete interrupt — possible, but setup is complex
  No clean boundary notification

Ping-pong DMA: descriptor A fills bufA, links to B. Descriptor B fills bufB, links to A.
  Each descriptor completion → deterministic IRQ → clean boundary event
  No polling. CPU wakes exactly every 16ms.
  Overhead: 2 descriptors vs 1. Worth it for clean architecture.

My choice: ping-pong. Reasoning: deterministic IRQ = decoupled processing.
\`\`\`

\`\`\`diagram
Decision 2: FreeRTOS queue vs shared volatile pointer

Shared pointer approach:
  volatile int32_t *current_buf;
  // ISR: current_buf = new_buf;   ← 4-byte write, atomic on ARM? Maybe.
  // Task: process(current_buf);   ← races if task reads while ISR writes

FreeRTOS queue (pointer-sized message):
  xQueueSendFromISR(&audio_q, &buf_ptr, &woken)  ← thread-safe by design
  // Provides: backpressure (if task too slow, ISR gets NACK immediately)
  //           blocking receive (task sleeps until data ready)
  //           no data races (internal critical section)

Overhead: queue add ~500 cycles vs pointer write ~2 cycles.
At 62.5 IRQ/sec: 500 cycles × 62.5 = 31,250 cycles/sec = 0.08ms/sec. Negligible.
\`\`\`

## Hardest Bug: USART1 I2S Erratum

\`\`\`diagram
Symptom: Logic analyzer shows LRCK occasionally misaligned by 1 bit.
  Every ~2 seconds: one sample in the wrong stereo slot.
  Audible: faint click/pop in audio.

Debug timeline:
  Day 1: Thought it was software bug. Checked descriptor chain.
         Nothing wrong in code. Added GPIO trace — confirmed periodic.
  Day 2: Varied CLKDIV. Bug disappeared at specific values.
         Found Silicon Labs KB article: USART1 erratum on EFR32BG13.
         Certain CLKDIV values cause LRCK framing glitch.

Workaround: Use CLKDIV value from Application Note (avoid errata range).
  Tested with 24-hour soak test: zero LRCK misalignments.
\`\`\`

## What I Would Do Differently

\`\`\`
1. Use hardware timer for benchmarking (not DWT)
   DWT CYCCNT can be reset by debugger → misleading measurements
   Timer peripheral is independent of debugger state

2. Add CRC32 verification on DMA buffer contents periodically
   Detect SRAM corruption under high EM interference
   Pattern: CRC32 a completed buffer, compare to re-read

3. Pre-compute FFT twiddle factors in flash (const)
   Currently arm_rfft_fast_init_f32() runs at init
   Flash twiddles: 1.5KB flash, 0 SRAM for init overhead

4. 48kHz sample rate (vs 16kHz)
   SPH0645 supports it. Higher sample rate = better wind frequency discrimination.
   Would exceed 16ms frame budget though — need optimization first.
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Mock Round 4 — Behavioral Prep & STAR Execution',
            content: `## Story 1: Technical Achievement (EFR32BG13 Project)

\`\`\`
Situation: I needed to build a real-time audio transparency mode on EFR32BG13.
           The latency requirement was under 20ms for inaudible pass-through.

Task: I was responsible for architecting and implementing the entire firmware
      stack — DMA, RTOS, DSP, BLE — without an existing reference design.

Action: I chose ping-pong LDMA descriptors after measuring 62.5 IRQ/sec vs
        32,000 IRQ/sec interrupt-driven. Designed 5-task FreeRTOS hierarchy
        with priorities matched to deadlines. Used DWT cycle counter to
        benchmark DSP at <4ms — well within 16ms frame budget. Implemented
        adaptive RMS gain control with per-sample interpolation to eliminate
        frame-boundary clicks.

Result: 17ms end-to-end latency. 8-hour battery life at continuous use.
        Wind detection 93% accuracy on 50-sample test corpus.
        GPIO trace confirms zero frame drops over 1-hour soak test.
\`\`\`

## Story 2: Innovation Under Constraint (Lucid Motors BMS)

\`\`\`
Situation: The cell monitoring ASIC in Lucid Air's BMS had no published
           SPI protocol documentation. The vendor provided only register maps.

Task: I was responsible for implementing the production firmware driver
      in time for battery certification.

Action: I captured SPI transactions with a logic analyzer to reverse-engineer
        the initialization sequence. Built an abstraction layer isolating
        the ASIC-specific protocol from the battery management algorithm.
        Wrote a test harness that validated all 47 register values on power-up.

Result: Driver shipped in production BMS. Patent filed — I am listed as
        first inventor on the SPI abstraction methodology.
        Battery certification passed on first attempt.
\`\`\`

## Story 3: Cross-Functional Collaboration

\`\`\`
Situation: Mic audio quality was consistently poor — boxy sound, unclear speech.
           I couldn't tell if it was hardware (mic bias) or software (DSP config).

Task: Isolate root cause collaboratively with the hardware engineer,
      without exclusive access to the prototype boards.

Action: I wrote diagnostic firmware that logged raw I2S samples before ANY
        DSP processing — pure captured data to a UART dump. The HW engineer
        probed the mic bias circuit simultaneously. We compared my raw samples
        against the mic datasheet SNR spec. Both our measurements pointed to
        bias voltage 200mV lower than spec due to a resistor tolerance stack-up.

Result: Hardware fix (different resistor value) in rev B boards.
        I wrote a software compensator for rev A units in the field
        that boosted gain to compensate, reducing the quality gap.
\`\`\`

## Story 4: Decision Under Uncertainty

\`\`\`
Situation: EFR32BG13 datasheet had ambiguous CLKDIV specification
           for the USART I2S mode I needed. Sprint deadline: 1 week.

Task: Choose a CLKDIV value and ship, without full vendor documentation.

Action: Built a minimal test harness that captured LRCK timing via GPIO
        and measured it against a known-good clock source. Tested 4 CLKDIV
        candidates. Three showed the erratum (periodic misalignment). One
        was clean. Validated with 24-hour soak test (zero errors).
        Documented findings and filed a bug report with Silicon Labs.

Result: Shipped on time with the validated CLKDIV. Silicon Labs confirmed
        the erratum and published an Application Note citing the workaround.
\`\`\`

## Practice Instruction

Record each story on your phone. Listen back and check:
- Do you say "I" or "we"? Fix every "we" to "I designed... / my colleague handled..."
- Is the result quantified? No numbers = weak result.
- Is it under 3 minutes? Time yourself with a stopwatch. Cut ruthlessly.
- Do you sound natural, or reciting? Keep the structure but vary the wording.`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Full Mock Interview — Structure & Debrief',
            content: `## Mock Interview Structure

\`\`\`diagram
Phase 1: Phone Screen Simulation (15 min)

  Minutes 0-2:  "Tell me about yourself" (90 seconds max)
                Structure: current role → relevant past → why Apple

  Minutes 2-9:  Technical Question 1 + 2
                Q1: Pipeline/NVIC — "What happens when an interrupt fires?"
                Q2: DMA — "Explain your ping-pong DMA design"

  Minutes 9-13: Behavioral — "Most complex technical project?"
                Use full STAR: setup → action (technical) → quantified result

  Minutes 13-15: Your question for them (one strong technical question)
\`\`\`

\`\`\`diagram
Phase 2: Technical Round Simulation (45 min)

  Min 0-2:   Brief intro
  Min 2-22:  Live coding (draw LDMA ping-pong + ISR on paper)
             Narrate as you go: "I'm setting up two descriptors..."
  Min 22-37: Debug scenario
             "CFSR=0x00000100 — walk me through your diagnosis"
             OR "frame drops at 1Hz — systematic debug approach?"
  Min 37-42: System architecture — "Add stereo, what changes?"
  Min 42-45: Q&A — your questions
\`\`\`

\`\`\`diagram
Phase 3: Project Round Simulation (20 min)

  Min 0-2:   Overview — 2-min opening statement
  Min 2-10:  Architecture walkthrough — draw the task diagram
             Be ready for: "why this queue size?" "why 256 samples?"
  Min 10-15: Hardest bug (USART1 erratum story)
  Min 15-18: Limitations vs production AirPods
  Min 18-20: What you'd add next + your question
\`\`\`

## Debrief Protocol

\`\`\`
Immediately after mock (within 5 minutes):
  1. Write your 3 weakest answers — be specific:
     BAD:  "I struggled with CFSR"
     GOOD: "I forgot that BFSR is bits[15:8] not bits[23:16]"

  2. Revisit ONLY those 3 topics tonight

  3. Practice those 3 questions cold first thing tomorrow morning
     (not reading — answering from memory, timed)
\`\`\`

## Common Weak Spots (Know Your Pattern)

\`\`\`diagram
Weak spot 1: CFSR field names (most common)
  Flashcard: MMFSR = bits[7:0], BFSR = bits[15:8], UFSR = bits[31:16]
  Memory trick: M first (lowest), then B, then U (highest bits)

Weak spot 2: System design missing power budget
  Fix: ALWAYS lead with numbers. State budget in first 60 seconds.
  "50mAh / 6h active = 8.3mA avg in active mode. Let me break that down..."

Weak spot 3: STAR stories drift to "we"
  Fix: Record yourself. Every "we" must become "I [specific action]"
\`\`\`

## CFSR Quick Decode (Memorize)

\`\`\`diagram
CFSR = 0x00000100
  → bits[7:0] = MMFSR = 0x00 (no MemManage fault)
  → bits[15:8] = BFSR = 0x01 = bit[0] = IBUSERR
  → Bus fault on instruction fetch
  → Check faulting PC at exception_frame[6]
  → Common cause: jumped to unmapped address (bad function pointer)
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Week 12 — Weak Area Review Method',
            content: `## How to Drill Weak Areas

\`\`\`diagram
The only method that builds real fluency:

1. Take your 3 weakest answers from mock debrief
2. Open this study guide to that section
3. Read until you feel you understand it
4. CLOSE the notes
5. Write the answer from scratch on paper (or whiteboard)
6. Open notes and compare — find the exact gap
7. Repeat steps 3-6 until you can write it clean in <3 min cold

"I can explain it when I re-read it" ≠ interview-ready
"I can write it clean from memory with no notes" = interview-ready
\`\`\`

## Full Audio Frame Path: Verbatim Memory Drill

Write this out from memory until it takes <90 seconds:

\`\`\`diagram
Sound
  → SPH0645 MEMS microphone
  → I2S bus: BCLK=1.024MHz, LRCK=16kHz (L channel only)
  → USART1 RX FIFO (hardware buffers incoming bits)
  → LDMA channel: 256-word P2M transfer, triggered by RXDATAV
  → rx_buf_A or rx_buf_B (ping-pong, descriptor links alternate)
  → LDMA IRQ fires: one buffer complete
  → xQueueSendFromISR(&audio_queue, &buf_ptr, &woken)
  → portYIELD_FROM_ISR(woken) — yield if MicSampler waiting
  → MicSampler task unblocks (xQueueReceive)
  → raw32 >> 14  (align 18-bit value to bits [17:0])
  → sign-extend from 18 bits to int32_t
  → xQueueSend to AudioProcessor task
  → arm_rms_f32(256) — RMS level → adaptive gain target
  → arm_rfft_fast_f32(256) — FFT → wind energy ratio
  → arm_scale_f32(256) — apply gain to samples
  → TX DMA descriptor → I2S TX → MAX98357A I2S input
  → MAX98357A D-class amplifier → speaker

Parallel during same 16ms frame:
  BLE Manager: polling BGAPI event queue
  NVM3Manager: checking if repack needed (1% duty)
  WatchdogPetter: collecting per-task bitmask
  Idle task: EMU_EnterEM2(true) between frame boundaries
\`\`\`

## Numbers to Know Cold

\`\`\`diagram
Frame size:          256 samples / 16kHz = 16ms
BCLK:                1.024 MHz
LDMA IRQ rate:       62.5 Hz (1000ms / 16ms)
ISR baseline latency: 12 cycles at 38.4 MHz = 312 ns
EM2 current:         1.4 µA (just MCU, radio off)
Flash endurance:     10,000 erase cycles per page
Flash page erase:    29.5 ms
HFXO accuracy:       ±20 ppm
LFXO accuracy:       ±20 ppm
HFRCO accuracy:      ±2.5% (after calibration: ±0.25%)
BLE connection interval: 500ms (our default)
\`\`\`

## Register Addresses to Know Cold

\`\`\`diagram
Fault registers (ARM Cortex-M4F):
  CFSR  = 0xE000ED28  (Configurable Fault Status Register)
  HFSR  = 0xE000ED2C  (HardFault Status Register)
  MMFAR = 0xE000ED34  (MemManage Fault Address Register)
  BFAR  = 0xE000ED38  (BusFault Address Register)

Debug registers:
  DWT_CTRL   = 0xE0001000
  DWT_CYCCNT = 0xE0001004

FPU registers:
  FPCCR      = 0xE000EF34  (lazy stacking control)
  CPACR      = 0xE000ED88  (FPU enable: bits[23:20] = 0xF)

MPU registers:
  MPU_TYPE   = 0xE000ED90  (read: number of regions)
  MPU_CTRL   = 0xE000ED94  (enable + PRIVDEFENA + HFNMIENA)
  MPU_RBAR   = 0xE000ED9C  (region base address)
  MPU_RASR   = 0xE000EDA0  (region attributes and size)
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'GitHub README & Architecture Diagram Best Practices',
            content: `## README Structure That Impresses Reviewers

\`\`\`diagram
Section 1: One-sentence description (above the fold)
  "Real-time audio transparency mode on EFR32BG13 — MEMS mic,
   I2S DMA pipeline, adaptive DSP, BLE control. 17ms latency."

Section 2: Demo GIF or logic analyzer screenshot
  Show the LDMA IRQ GPIO trace + audio waveform.
  Visual proof that it actually works.

Section 3: Hardware list
  - Silicon Labs EFR32BG13 (Thunderboard)
  - SPH0645 MEMS microphone (I2S)
  - MAX98357A I2S amplifier
  - J-Link for SWD/SWO debug

Section 4: Build (3 commands max)
  git clone ...
  make BOARD=efr32bg13
  make flash

Section 5: 3 Key Design Decisions (with rationale)
  Ping-pong DMA: why not circular (see below)
  FreeRTOS: why not bare-metal
  256-sample block: why not 128 or 512

Section 6: Measured Results
  Latency: 17ms (GPIO trace screenshot)
  Battery: 8h (Energy Profiler screenshot)
  Wind detection: 93% on 50-sample test corpus
  DSP overhead: 0.29ms per frame (DWT cycles)

Section 7: Limitations vs Production (MOST IMPORTANT FOR INTERVIEWS)
\`\`\`

## Limitations vs Production Table

| Feature | This project | AirPods Pro | Gap reason |
|---------|-------------|-------------|------------|
| Latency | 17ms | <1ms ANC | Hardware DSP needed |
| Sample rate | 16 kHz | 48 kHz | SPH0645 + compute limit |
| ANC algorithm | None (heuristic) | FxLMS adaptive | Dedicated DSP required |
| BLE security | CRC32 OTA | ECDSA-P256 | mbedTLS not integrated |
| DSP architecture | RTOS task | Bare-metal ISR | Not achievable at 16ms |

This table is interview gold — shows you understand the production gap honestly.

## Future Features to Add (While Waiting for Interview)

\`\`\`diagram
Feature 1: ECDSA-P256 OTA (3-4 days)
  mbedtls_pk_verify() with P-256 public key embedded in bootloader
  mbedTLS subset: ~16KB flash. Worth it for production-grade security.
  Talking point: "I added ECDSA signing to the OTA pipeline last week"

Feature 2: Stereo beamforming (1 week)
  Two SPH0645 mics at 30mm spacing
  Delay-and-sum: shift channel B by d×sin(θ)/c samples
  At d=30mm, θ=0°: aligned. θ=90°: max delay = 30mm/343m/s = 87µs = 1.4 samples at 16kHz
  Result: +3dB SNR, directional front pickup

Feature 3: 5-band parametric EQ via BLE (3-4 days)
  arm_biquad_cascade_df1_f32(): 5 stages, 25 coefficients
  BLE characteristic: write center freq + gain + Q per band
  Real-time coefficient update: swap under mutex
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Resume & LinkedIn — Quantified Bullet Points',
            content: `## Resume Bullet Formula

Every bullet must answer three questions: **What** did you build? **How** (what technology)? **So what** (measured result)?

Format: [Action verb] [technology/method] achieving/resulting in [quantified outcome]

## The Three EFR32BG13 Resume Bullets

\`\`\`
Bullet 1 — DMA Architecture:
"Designed LDMA ping-pong DMA pipeline for real-time I2S audio capture
 on EFR32BG13, achieving 17ms end-to-end transparency latency at
 62.5 IRQ/sec (vs 32,000 IRQ/sec with interrupt-driven approach)"

  ↑ Action     ↑ Technology                    ↑ Quantified outcome + comparison

Bullet 2 — DSP + Optimization:
"Implemented adaptive gain control and FFT-based wind noise detection
 using CMSIS-DSP within a 16ms FreeRTOS frame budget; benchmarked
 via DWT cycle counter, achieving <4ms DSP overhead per frame"

Bullet 3 — System Architecture:
"Architected dual-bank OTA bootloader with CRC32 verification and
 anti-rollback counter; designed multi-task FreeRTOS watchdog with
 per-task bitmask liveness monitoring and automatic recovery"
\`\`\`

## LinkedIn Skills to Add

\`\`\`
Technical skills (add all):
  FreeRTOS, LDMA/DMA, I2S, SPI, I2C
  ARM Cortex-M4F, Cortex-M33, CMSIS-DSP
  BLE GATT, Bluetooth Low Energy, Silicon Labs EFR32
  NVM3, EM2 Power Management, ULFRCO, HFXO
  ITM/SWO Debug, J-Link, GNU ARM toolchain
  Linker scripts, MPU, TrustZone-M (conceptual)
  Adaptive filtering, real-time audio DSP
\`\`\`

## Cover Letter (3 Sentences Maximum)

\`\`\`
Sentence 1 — Proof of relevant work:
  "I built a working audio transparency mode prototype on EFR32BG13 —
   real-time I2S audio, LDMA ping-pong DMA, adaptive CMSIS-DSP, and
   BLE control — specifically to prepare for this role."

Sentence 2 — Commercial experience:
  "My Lucid Motors firmware experience (BMS SPI driver patent, embedded C
   in safety-critical system) grounds my RTOS and hardware interface knowledge."

Sentence 3 — Why Apple specifically:
  "I want to apply these skills on AirPods where the latency, power, and
   acoustic constraints are orders of magnitude harder than anything I can
   build on a dev board."
\`\`\`

## Non-Technical Explanation (Practice for PM Interview)

> "I built a prototype of the AirPods transparency mode. A tiny microphone on the outside captures everything around you. A microchip inside processes that audio in 17 milliseconds — faster than you can consciously notice any delay — and plays it in your ear so you can hear the world while listening to music. Bluetooth lets a phone app turn the mode on and off and adjust the volume. The whole system runs on a 3V coin cell for 8 hours."`,
          },
        ],
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
        readingNotes: [
          {
            source: 'Application Strategy & Backup Pipeline',
            content: `## Apple Hiring Timeline

\`\`\`diagram
Week 1-2:  Application submitted
Week 2-4:  Recruiter reviews (large volume — be patient)
Week 3-5:  Recruiter reaches out (if interested)
Week 4-6:  Technical phone screen scheduled
Week 6-10: On-site scheduled (Apple is thorough — this takes time)
Week 10-12: Offer or feedback

Normal: 4-8 weeks before first contact.
DO NOT panic before week 6.
DO NOT email recruiter more than once before week 4.
\`\`\`

## Backup Pipeline: Apply Simultaneously

\`\`\`diagram
Company              Role                    Why relevant
─────────────────────────────────────────────────────────────
Apple                Firmware AirPods        Primary target
Google Wearables     Pixel Buds firmware     Similar ANC/audio stack
Bose                 Audio firmware          Deep ANC expertise
Qualcomm CSRA68100   Audio SoC firmware      Closest to your hardware
Beats by Dre         Embedded firmware       Apple subsidiary, diff pipeline
Amazon Lab126        ANC headphone firmware  Growing audio team
\`\`\`

Start backup applications Week 12 — in parallel, not after rejection.

## The Project Improvement Loop

Every new feature = a follow-up reason AND stronger resume bullet:

\`\`\`diagram
Week 12: Apply (current project state)
  ↓
Week 13: Add ECDSA-P256 OTA verification
  → Follow-up email: "Added cryptographic OTA signing to my project"
  ↓
Week 14: Add stereo beamforming
  → Follow-up email: "Added stereo beamforming with delay-and-sum"
  ↓
Week 15: Add 5-band parametric EQ via BLE
  → Follow-up email: "Added real-time BLE-controlled EQ"
  ↓
Week 16: Add live audio level streaming via BLE notifications
  → GitHub stars increasing → social proof
\`\`\`

## LinkedIn Outreach Strategy

\`\`\`
Step 1: Find Apple firmware engineers
  LinkedIn search: "Apple" + "firmware engineer" + "AirPods"
  Or: "Silicon Labs" alumni → "Apple"

Step 2: Connect with brief note (not a referral request yet):
  "Hi [Name], I built an audio transparency mode on EFR32BG13 studying
   for this domain — would love your perspective on the audio firmware
   space at Apple if you have 15 minutes sometime."

Step 3: If they respond, have a genuine conversation.
  After establishing rapport: "I'm actively applying to firmware roles
  at Apple — if there's a referral process and you think my work is
  relevant, I'd really appreciate it."

Never lead with a referral request. Build rapport first.
\`\`\`

## Follow-Up Email Template (Week 4)

\`\`\`
Subject: Follow-up: [Your Name] — [Role ID] Application

Hi [Recruiter Name],

I wanted to follow up on my application for [Job Title, Role ID].

Since applying, I've added ECDSA-P256 OTA firmware signing to my
EFR32BG13 project — the bootloader now verifies SHA-256+ECDSA before
swapping banks. GitHub: [link]

Still very interested in the role. Happy to provide any additional
information.

Best,
[Name]
\`\`\``,
          },
        ],
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
        readingNotes: [
          {
            source: 'Final Cold Assessment — 6 Tests Before You Apply',
            content: `## The Final 6 Tests

Close every note. Answer from memory. Time yourself.

## Test 1: LDMA Ping-Pong (target: <3 min)

Draw the complete setup on paper: two descriptor structs with link fields (+1/-1 offsets), channel config with peripheral signal, IRQ handler calling xQueueSendFromISR and portYIELD_FROM_ISR. No notes.

## Test 2: CFSR Decode (target: <60 sec)

\`\`\`diagram
CFSR = 0x00008200

Parse:
  bits[31:16] = UFSR = 0x0000  → no usage fault
  bits[15:8]  = BFSR = 0x82   = 1000 0010
    bit[15] = BFARVALID = 1   → BFAR register valid
    bit[9]  = PRECISERR = 1   → precise data bus fault

Diagnosis:
  Precise bus fault. BFAR has the invalid address.
  Get faulting PC from exception_frame[6].
  (Read PSP if LR bit[2]=1, MSP if bit[2]=0)
\`\`\`

## Test 3: EM3 + BLE (target: <30 sec)

> "EM3 stops LFXO. BLE connection timing requires ±50 ppm. The only oscillator available in EM3 is ULFRCO at ±2% = ±20,000 ppm — 400× too inaccurate for BLE. So we must stay in EM2, which keeps LFXO running."

## Test 4: EXC_RETURN bit[2] (target: <60 sec)

> "EXC_RETURN bit[2] is SPSEL. Value 1 means PSP was active when the exception fired — task context, typical for FreeRTOS tasks. Value 0 means MSP was active — handler or privileged context. In a HardFault from a FreeRTOS task: bit[2]=1, so read PSP to find the exception frame, and frame[6] is the faulting PC."

## Test 5: M33 vs M4F (target: <45 sec)

> "Three additions. First: TrustZone-M — the SAU partitions address space into Secure and Non-Secure regions, with NSC veneers as the only valid entry points. Second: 16-region MPU instead of 8. Third: four stack pointers instead of two — Secure-MSP, Secure-PSP, NS-MSP, and NS-PSP."

## Test 6: Full Audio Frame Path (target: <90 sec)

\`\`\`diagram
Sound → SPH0645 mic → I2S bus (BCLK 1.024MHz, LRCK 16kHz)
  → USART1 RX FIFO → LDMA 256-word transfer
  → rx_buf_A or rx_buf_B → LDMA IRQ
  → xQueueSendFromISR → MicSampler task
  → raw32>>14 + sign-extend 18-bit → AudioProcessor queue
  → arm_rms_f32 + arm_rfft_fast_f32 + arm_scale_f32
  → TX DMA → I2S TX → MAX98357A → speaker
  Total: 17ms latency
\`\`\`

## What Passing Looks Like

\`\`\`diagram
Pass all 6 cleanly, no notes, under time limits.

If you pass:
  You built something real. You measured it.
  You hit real bugs (USART1 erratum).
  You can explain every design decision with measured data.
  You understand the gap between your prototype and production.

  That is exactly what Apple is looking for.
  Apply.
\`\`\``,
          },
        ],
      },
    ],
  },
];

export default interviewPrepData;
