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
            source: 'ARM Cortex-M4F TRM §2.1–2.3 — Processor Features & Pipeline',
            bullets: [
              '3-stage pipeline: Fetch → Decode → Execute (in-order, no out-of-order execution)',
              'Branch taken penalty: 1–3 cycles pipeline refill',
              'No TrustZone (M33 adds it); no data cache; optional FPU (single-precision)',
              'Thumb-2 ISA: 16-bit and 32-bit instructions interleaved transparently',
              'Two stacks: MSP (main, used in Handler mode and privileged Thread) and PSP (task stacks in FreeRTOS)',
            ],
          },
          {
            source: 'ARM Cortex-M4F TRM §B1.5 — NVIC & Exception Model',
            bullets: [
              'Hardware stacks 8 registers on exception entry: xPSR, PC, LR, r12, r3, r2, r1, r0 — always from the active stack',
              'Total interrupt latency from assertion to first ISR instruction: 12 cycles (no FPU, no wait states)',
              'With FPU lazy stacking enabled: worst-case latency increases by up to 12 additional cycles (space reserved but not filled until ISR uses FPU)',
              'Tail-chaining: when an exception is pending at exception exit, hardware skips pop+push — stays in Handler mode, saves 6 cycles',
              'Late-arrival: if higher-priority IRQ fires during the stacking sequence, NVIC pre-empts to serve higher priority first; the stacking is shared',
              'Priority: 8-bit field (256 levels); only upper bits implemented — EFR32BG13 implements 4 bits = 16 levels',
              'configMAX_SYSCALL_INTERRUPT_PRIORITY: FreeRTOS masks IRQs at or below this priority via BASEPRI; IRQs above this (lower number) can still run but must NOT call FreeRTOS APIs',
              'EXC_RETURN: special value loaded into LR on exception entry; bit[2]=1 means PSP was active (task stack), bit[3]=0 means FP state was pushed',
            ],
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
            source: 'EFR32BG13 — USART0 UART Configuration',
            bullets: [
              'USART0 base address: 0x40010000. Baud rate set via CLKDIV register: CLKDIV = 256×(fHFPERCLK/baud − 1)',
              'At 38.4 MHz HFPERCLK, 115200 baud: CLKDIV ≈ 84,377 (0x149A0)',
              'TXBL flag in STATUS register: set when TX buffer has space. Poll or use interrupt',
              'TXDATA register: write one byte; hardware serializes automatically',
              'Enable sequence: CMU_ClockEnable(cmuClock_USART0) → GPIO route → USART_InitAsync() → USART_Enable()',
            ],
          },
          {
            source: 'ISR Design Rules — Reentrancy & FreeRTOS FromISR APIs',
            bullets: [
              'printf() internally uses a global FILE* stdout buffer — calling it from two contexts simultaneously corrupts state (not reentrant)',
              'newlib malloc() uses a global heap lock (dlmalloc); if main-thread code holds the lock when IRQ fires and ISR calls malloc() → deadlock',
              'FreeRTOS rule: any API that may block is forbidden in ISRs. Use xQueueSendFromISR(), xSemaphoreGiveFromISR() instead',
              'FromISR APIs return pxHigherPriorityTaskWoken; if pdTRUE, call portYIELD_FROM_ISR() at end of ISR to trigger immediate context switch',
              'ISR golden rule: set a flag or post to a queue, then return. All processing in task context',
              'GPIO interrupt: configure with GPIO_ExtIntConfig(), enable with GPIO_IntEnable(), handle in GPIO_ODD_IRQHandler / GPIO_EVEN_IRQHandler',
            ],
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
            source: 'EFR32BG13 Datasheet §4 — CMU Oscillator Specifications',
            bullets: [
              'HFXO (High-Frequency Crystal Oscillator): external crystal, 38.4 MHz for BLE. Accuracy: ±20 ppm. Startup time: ~1 ms (typ). Required for BLE radio (radio requires precise timing)',
              'HFRCO (High-Frequency RC Oscillator): internal, no external component. Accuracy: ±2.5% at room temperature (Table 4.41). Startup: ~300 ns at ≥19 MHz bands. Tunable via HFRCOCAL register',
              'HFRCO bands: 1/2/4/7/13/16/19/26/32/38 MHz selectable. Default: 19 MHz on reset',
              'LFXO (Low-Frequency Crystal Oscillator): 32.768 kHz external crystal, ±20 ppm. Used in EM2 for BLE connection timing and RTCC',
              'ULFRCO (Ultra-Low-Frequency RC): ~1 kHz internal, ±2% accuracy. Runs in EM3/EM4. NOT accurate enough for BLE (BLE needs ±50 ppm for connection events)',
              'Clock tree: HFXO/HFRCO → HFCLK → HFCORECLK (CPU) and HFPERCLK (peripherals). Dividers configurable via CMU',
              'BLE radio sequencer: automatically switches from HFRCO to HFXO before radio events, then back. Firmware does not need to manage this transition manually',
              'CMU_ClockEnable(cmuClock_HFXO) / CMU_OscillatorEnable() / CMU_ClockSelectSet() are the SDK calls to configure the clock tree',
            ],
          },
          {
            source: 'EFR32BG13 Datasheet §4 — Energy Modes Overview',
            bullets: [
              'EM0 (Active): CPU running. Typical current ~5.5 mA at 38.4 MHz from HFXO with DC-DC',
              'EM1 (Sleep): CPU stopped, peripherals + DMA run. Current ~1 mA',
              'EM2 (Deep Sleep): HFCLK stopped. Only LFXO/LFRC/ULFRCO run. RTCC, LESENSE, LEUART active. Typical: 1.4 µA (64 kB RAM retained, RTCC from LFXO, DC-DC LP mode)',
              'EM3: LFXO and LFRCO also stopped. Only ULFRCO (±2%) remains. BLE CANNOT use EM3 — needs ±50 ppm for connection events',
              'EM4 (Hibernate/Shutoff): SRAM lost. Only GPIO wakeup or reset. Typ ~0.1 µA',
              'BLE minimum sleep: EM2 (LFXO keeps connection timing). Radio wakes up for each connection event',
            ],
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
            source: 'ARM Cortex-M4F TRM §B3 — Memory Map',
            bullets: [
              '4 GB address space divided into fixed regions:',
              '0x00000000–0x1FFFFFFF: Code (512 MB) — flash lives here; default executable',
              '0x20000000–0x3FFFFFFF: SRAM (512 MB) — EFR32BG13 has 64 KB at 0x20000000',
              '0x40000000–0x5FFFFFFF: Peripheral (512 MB) — EFR32BG13 peripherals at 0x4000xxxx',
              '0xE0000000–0xE00FFFFF: Private Peripheral Bus (PPB) — NVIC, SysTick, DWT, ITM, MPU registers live here',
              'SRAM is executable by default (no XN bit set in default map) — MPU needed to enforce XN on stack',
            ],
          },
          {
            source: 'ARM Cortex-M4F TRM §B3.5 — MPU Registers',
            bullets: [
              'MPU supports exactly 8 protection regions (M33 has 16)',
              'MPU_TYPE (0xE000ED90): DREGION field = 8, confirms 8 data regions supported',
              'MPU_CTRL (0xE000ED94): ENABLE bit[0], PRIVDEFENA bit[2] (privileged code uses default map for unmapped regions)',
              'MPU_RNR (0xE000ED98): region number register — write 0–7 to select which region to configure',
              'MPU_RBAR (0xE000ED9C): base address (must be aligned to region size) + VALID bit + REGION field',
              'MPU_RASR (0xE000EDA0): SIZE field (region size = 2^(SIZE+1) bytes, min 32B), AP[2:0] (access permissions), XN bit (execute never), TEX/S/C/B (memory type)',
              'AP field values: 000=no access, 001=priv R/W, 011=full R/W, 111=read-only',
              'Region priority: higher region number wins when regions overlap',
              'Use case: FreeRTOS MPU port wraps each task stack with a dedicated MPU region set to XN + priv-only, detects stack overflow via MemManage fault instead of corruption',
              'Use case: mark peripheral region as Device (non-cacheable, non-bufferable) and XN to prevent speculative fetches',
            ],
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
            source: 'GNU LD Linker Script — MEMORY, SECTIONS, LMA/VMA',
            bullets: [
              'LMA (Load Memory Address): where the section is stored in the binary (flash). The physical address the bootloader or programmer writes',
              'VMA (Virtual Memory Address): where the section is accessed at runtime. .data VMA = SRAM address',
              'MEMORY directive defines named regions: FLASH (rx) and RAM (rwx) with ORIGIN and LENGTH',
              '.text section: VMA = LMA = flash address. Code runs directly from flash (XIP on M4)',
              '.data section: LMA = flash (after .text), VMA = SRAM. Linker generates __data_start__, __data_end__, __data_load__ symbols',
              '.bss section: VMA = SRAM, not stored in binary at all. Startup must zero it. __bss_start__ and __bss_end__ symbols delimit the range',
              'AT> directive: places section in FLASH physically while giving it a SRAM VMA. e.g., .data : AT > FLASH { } > RAM',
              'Startup copy loop (Reset_Handler): for(p=__data_start__; p<__data_end__; ) *p++ = *src++;',
              'Without the copy loop: .data variables read from SRAM which was never initialized → garbage values → silent bugs',
              'EFR32BG13 boot: Reset_Handler → copy .data → zero .bss → call SystemInit() → call main()',
            ],
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
            source: 'EFR32BG13 Datasheet §4 — Flash Characteristics',
            bullets: [
              'Flash technology: NOR flash, floating-gate cells. Bit=1: no charge on gate (low threshold). Bit=0: charge trapped (high threshold)',
              'Write (program): only 1→0. To change a 0→1, you must erase the entire page first',
              'Erase granularity: full page (2 KB page size on EFR32BG13). Cannot erase single byte or word',
              'Write timing: burst write 20–30 µs typical (26.3 µs). No partial-word writes; must write full 32-bit words',
              'Erase timing: page erase 20–40 ms, typical 29.5 ms. This blocks the CPU unless background erase is used',
              'Endurance: minimum 10,000 erase cycles per page. After this, bit errors increase. Plan wear leveling from day one',
              'MSC (Memory System Controller): EFR32BG13 flash controller. MSC_WRITECMD register: LADDRIM (load address) + WRITETRIG (trigger write). MSC_STATUS: BUSY flag',
              'Firmware implications: (1) never write to flash while ISR may read code from same page, (2) use NVM3 for structured key-value storage with automatic wear leveling, (3) repack (compaction) is the only blocking O(n) operation — run it in low-priority task',
            ],
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
            source: 'FreeRTOS — FreeRTOSConfig.h Critical Settings',
            bullets: [
              'configTOTAL_HEAP_SIZE: size of the static byte array FreeRTOS uses as its heap pool. Must fit within available SRAM',
              'EFR32BG13: 64 KB total SRAM. Budget: ~4 KB for .data/.bss, 8 KB per task stack × N tasks, plus queue buffers',
              'configMINIMAL_STACK_SIZE: stack for Idle task (in words, not bytes). Minimum ~128 words (512 bytes)',
              'configMAX_PRIORITIES: number of priority levels. Each level allocates a ready-list entry. Keep ≤ 8 for embedded',
              'configUSE_PREEMPTION: 1 = preemptive scheduler (default). 0 = cooperative (must call taskYIELD)',
              'configTICK_RATE_HZ: SysTick rate. 1000 = 1 ms tick. Higher = better resolution, more overhead',
              'configUSE_MUTEXES: 1 enables mutex creation (priority inheritance). Without this, only binary semaphores available',
              'configUSE_RECURSIVE_MUTEXES: for reentrant mutex acquisition by same task',
              'Heap allocators: heap_1 (no free), heap_2 (best-fit, no coalescing), heap_3 (wraps malloc), heap_4 (best-fit + coalescing), heap_5 (multiple non-contiguous regions)',
              'heap_4 recommended for EFR32BG13: coalesces freed blocks, deterministic enough for infrequent allocations',
              'Heap exhaustion: pvPortMalloc() returns NULL. xTaskCreate() returns errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY. Always assert the return value',
              'Monitor: xPortGetFreeHeapSize() (current free), xPortGetMinimumEverFreeHeapSize() (low watermark)',
            ],
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
            bullets: [
              'SysTick fires at configTICK_RATE_HZ (e.g., 1000 Hz). Calls xTaskIncrementTick() — moves delayed tasks to ready list, checks preemption',
              'If a higher-priority task is unblocked by the tick, SysTick sets the PENDSVSET bit in ICSR (Interrupt Control and State Register, 0xE000ED04)',
              'PendSV is configured at lowest possible priority (0xFF). It pends and waits until no other IRQ is active',
              'Context switch in PendSV_Handler (assembly): saves r4–r11 + PSP to current task stack, loads new task PSP, restores r4–r11, returns via EXC_RETURN',
              'Hardware auto-saves r0–r3, r12, LR, PC, xPSR on exception entry — PendSV only needs to save/restore the "callee-saved" registers',
              'Ready list: xList_t pxReadyTasksLists[configMAX_PRIORITIES]. Each priority has a circular linked list of TCBs',
              'Delayed list: xDelayedTaskList. xTaskDelayUntil() inserts tasks sorted by wake time. SysTick checks head of list each tick',
              'Idle task: lowest priority, always ready. Calls vApplicationIdleHook() which typically enters EM2 sleep (WFI instruction)',
              'vTaskDelay(n): blocks calling task for n ticks. Internally calls xTaskGenericDelay() which adds to delayed list and calls taskYIELD',
            ],
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
            source: 'FreeRTOS — Queues, Mutexes & Priority Inheritance',
            bullets: [
              'Queue: stores copies of data by value (not pointer). Size = itemSize × length. Thread-safe FIFO. Can block sender/receiver',
              'xQueueSend(): blocks if full (up to portMAX_DELAY). xQueueSendFromISR(): never blocks, returns errQUEUE_FULL',
              'Binary semaphore: signaling only, no ownership. No priority inheritance',
              'Mutex: like binary semaphore but tracks owner (TCB*). Enables priority inheritance',
              'Priority inheritance: when high-priority task H blocks on mutex held by low-priority task L, FreeRTOS temporarily boosts L to H\'s priority so L can complete and release mutex',
              'Mars Pathfinder 1997: H=bus manager (high), M=comms (medium), L=meteorological (low holds mutex). M ran continuously, L couldn\'t run to release mutex, H starved → watchdog reset',
              'Fix: enable priority inheritance. In FreeRTOS: configUSE_MUTEXES=1 and use xSemaphoreCreateMutex() (not binary semaphore)',
              'Priority ceiling protocol (not in FreeRTOS): alternative — mutex holder always runs at ceiling priority. More predictable but wastes priority budget',
              'Deadlock: TaskA holds mutex1, waits for mutex2. TaskB holds mutex2, waits for mutex1 → both block forever. FreeRTOS does NOT detect deadlocks. Design: always acquire mutexes in same order',
              'Recursive mutex: xSemaphoreCreateRecursiveMutex(). Same task can take it N times, must give N times. Use for reentrant code paths',
            ],
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
            source: 'FreeRTOS — Stack Overflow Detection & Heap Sizing',
            bullets: [
              'configCHECK_FOR_STACK_OVERFLOW: 0=off, 1=mode1, 2=mode2',
              'Mode 1: checks if PSP has gone below stack bottom at each context switch. Fast, catches obvious overflows',
              'Mode 2: fills entire stack with 0xA5A5A5A5 at task creation. Checks if last 20 bytes still contain 0xA5 at every context switch',
              'Mode 2 advantage: detects overflow even if PSP recovered before switch (e.g., ISR used stack and returned)',
              'Mode 2 can miss: (1) overflow and recovery within one scheduling period, (2) overflow that doesn\'t reach sentinel zone (last 20 bytes), (3) task only runs rarely so overflow sits undetected',
              'vApplicationStackOverflowHook(xTaskHandle, char* name): called on detection. Cannot return. Log name, trigger watchdog reset',
              'uxTaskGetStackHighWaterMark(taskHandle): returns minimum free words ever seen. Use during development to right-size stacks',
              'Typical stack sizes: ISR-heavy task 512 words (2KB), simple task 256 words, idle 128 words',
              'uxTaskGetStackHighWaterMark() returns words remaining, NOT bytes. Multiply by 4 for bytes on 32-bit ARM',
              'Never trust stack measurement from one test run — worst case is the recursive call or deepest ISR nesting. Add 20% margin',
            ],
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
            source: 'EFR32BG13 Datasheet §4 — LDMA Architecture',
            bullets: [
              'LDMA: Linked DMA with 8 independent channels. Descriptor chain eliminates CPU intervention between transfers',
              'Descriptor types: XFER (data transfer), SYNC (wait for trigger), WRI (write to memory). For audio: XFER only',
              'Descriptor layout (LDMA_Descriptor_t): SRC, DST, CTRL (count, size, link), LINK (next descriptor address)',
              'CTRL.DONEIEN: set to 1 to generate interrupt when this descriptor completes',
              'CTRL.BYTESWAP: can swap endianness inline. CTRL.BLOCKSIZE: transfers per arbitration round',
              'Channel arbitration: round-robin among active channels. Lower channel number = higher priority when simultaneous requests',
              'Peripheral request signal: each USART/TIMER/ADC has a dedicated LDMA request line. USART1 RX: ldmaPeripheralSignal_USART1_RXDATAV fires when RX FIFO has data',
              'Ping-pong setup: DescA{src=USART1_RXDATA, dst=bufA, count=256, link=DescB, DONEIEN=1} → DescB{src=USART1_RXDATA, dst=bufB, count=256, link=DescA, DONEIEN=1}',
              'On DescA completion: IRQ fires, ISR calls xQueueSendFromISR(bufA). LDMA hardware already fetching DescB in background — zero gap',
              'Channel start: LDMA_StartTransfer(channel, &chCfg, &descA). chCfg specifies peripheral signal',
            ],
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
            source: 'LDMA Ping-Pong vs Interrupt-Driven — Performance Analysis',
            bullets: [
              'I2S at 16 kHz stereo: 32,000 32-bit words/sec. Interrupt-per-sample = 32,000 IRQs/sec',
              'Each IRQ: 12-cycle entry + ISR body + 12-cycle exit ≈ ~40 cycles. At 38.4 MHz: 32,000 × 40 = 1.28M cycles/sec = 3.3% CPU just for interrupt overhead',
              'More critical: 32,000 context switches/sec disrupts FreeRTOS task scheduling — tasks never get contiguous CPU time',
              'Ping-pong DMA with 256-sample blocks: 1 IRQ per block. 32,000/256 = 125 IRQs/sec. 0.01% CPU overhead',
              'Frame period = 256/16000 = 16 ms. CPU is completely free for full 16 ms between IRQs for DSP, BLE, NVM3',
              'DMA handles byte-by-byte transfer autonomously via bus matrix — does NOT stall CPU or consume pipeline bandwidth',
              'Circular DMA (single buffer): CPU must process faster than DMA fills. Miss → data overwritten silently',
              'Ping-pong advantage: while CPU processes bufA, DMA fills bufB. Even if DSP runs slow, bufA is safe',
              'missed_frames counter: increment in LDMA_IRQHandler if queue is full (xQueueSendFromISR returns errQUEUE_FULL). Monitor for system overload',
            ],
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
            source: 'ARM Cortex-M4F TRM §B1.5.7 — FPU Lazy Stacking (FPCCR)',
            bullets: [
              'FPU context: 16 single-precision registers S0–S15 + FPSCR. Full push = 17 words = 68 bytes extra on exception entry',
              'Lazy stacking: hardware reserves space for FP context on stack but does NOT write the registers immediately',
              'FPCCR (FP Context Control Register, 0xE000EF34): LSPEN bit[30] enables lazy stacking (default=1)',
              'FPCAR (FP Context Address Register, 0xE000EF38): holds address of the reserved space. If ISR executes FPU instruction, hardware fills it retroactively',
              'Benefit of lazy stacking: if ISR never uses FPU, saves 68 bytes of stack push/pop — interrupt latency stays at 12 cycles',
              'Cost: if ISR does use FPU, worst-case latency = 12 + 12 = 24 cycles (lazy fill adds ~12 cycles)',
              'When to disable LSPEN: ISR always uses FPU AND you need deterministic worst-case latency (e.g., motor control with hard timing). Disable: FPCCR &= ~(1<<30)',
              'DWT cycle counter (0xE0001004 DWT_CYCCNT): enable with DWT_CTRL |= 1. uint32_t t0 = DWT->CYCCNT; ... uint32_t elapsed = DWT->CYCCNT - t0',
              'FreeRTOS critical sections: taskENTER_CRITICAL() sets BASEPRI to configMAX_SYSCALL_INTERRUPT_PRIORITY. Does NOT disable FPU lazy stacking issues — FPU state is per-task, managed by FreeRTOS port',
            ],
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
            source: 'I2S Protocol Specification — Timing & Signal Definitions',
            bullets: [
              'I2S signals: BCLK (bit clock, continuous), LRCK/WS (word select, L=low, R=high), DATA (serial data MSB first)',
              'BCLK = sample_rate × channels × bits_per_frame. For 16 kHz stereo 32-bit: 16000 × 2 × 32 = 1,024,000 Hz = 1.024 MHz',
              'LRCK = sample_rate = 16,000 Hz. DATA changes on BCLK falling edge; sampled on rising edge (standard I2S)',
              'Data is left-justified in the frame: MSB on first BCLK after LRCK edge, MSB-first',
              'Standard I2S: data starts 1 BCLK after LRCK edge (one cycle delay)',
            ],
          },
          {
            source: 'SPH0645/ICS-43434 MEMS Mic Datasheet — Data Format',
            bullets: [
              'SPH0645 output: 18-bit resolution, left-justified in a 24-bit slot within a 32-bit frame',
              'Bit layout in 32-bit word (MSB first): bits[31:14] = 18-bit audio data. Bits[13:0] = zeros (padding)',
              'To extract sample: raw32 >> 14 gives a 18-bit unsigned value. Sign-extend from bit 17: if bit 17 set, OR with 0xFFFC0000',
              'EFR32BG13 USART I2S mode: USART1 has dedicated I2S support. Configure USART_I2sInit() with frameLength=32, dataDelay=1 (standard I2S)',
              'USART1 workaround on EFR32BG13: USART1 has an erratum — I2S frame sync may glitch on certain clock divider ratios. Workaround: use specific CLKDIV value and SYNC pulse width config per Silicon Labs AN',
              'LDMA request: USART1_RXDATAV signal fires when RX FIFO has a new 32-bit word. Each word = one 32-bit I2S frame (one sample from L or R channel)',
            ],
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
            source: 'I2S DMA Pipeline Debug — Systematic Approach',
            bullets: [
              'Step 1 — Quantify: increment volatile uint32_t missed_frames in LDMA_IRQHandler when xQueueSendFromISR returns errQUEUE_FULL. Read via BLE characteristic or ITM port 1',
              'Step 2 — Heap: xPortGetMinimumEverFreeHeapSize(). If low, heap fragmentation may cause pvPortMalloc() delays in audio path. Solution: pre-allocate all buffers at init',
              'Step 3 — CPU time: configGENERATE_RUN_TIME_STATS=1 + vTaskGetRunTimeStats(buf). Check if AudioProcessor task is consuming >80% of frame time',
              'Step 4 — GPIO trace: PA5=LDMA IRQ toggle, PA6=AudioProcessor task entry/exit. Logic analyzer reveals whether gap between IRQ and processing is growing over time',
              'Step 5 — NVM3: nvm3_repack() runs O(pages) time (~29.5ms per page erase). If called from audio task context, blocks for 29.5ms → drops entire frame. Move repack to dedicated low-priority task',
              'Step 6 — BLE: if BLE Manager task priority is too high, it can preempt AudioProcessor. Check mutex hold times with DWT timestamps',
              'DWT timestamps in ISR: no RTOS API calls, just DWT->CYCCNT reads. Log to circular buffer in SRAM, dump via BLE',
              'Root cause checklist: (1) NVM3 repack in wrong task, (2) heap exhaustion causing retry loops, (3) BLE connection event blocking, (4) watchdog pet task missing its window, (5) temperature-induced oscillator drift affecting BCLK',
            ],
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
            source: 'MAX98357A Datasheet — I2S DAC/Amplifier Operation',
            bullets: [
              'MAX98357A: Class D amplifier with integrated I2S DAC. Slave mode only — must be driven by master BCLK/LRCK',
              'Output power: 3.2W into 4Ω at 5V, 1.4W into 8Ω. Filterless output — connect directly to speaker with short traces',
              'SD_MODE pin: HIGH=left channel, LOW=shutdown (200ms soft shutdown), float=left+right averaged, pulled high via resistor for stereo sum',
              'BCLK loss: amp loses I2S framing. Output capacitors charge to mid-supply (VDD/2) → audible pop/click when signal resumes. Same issue on LRCK glitch',
              'Correct silence: keep BCLK and LRCK running. Send all-zero samples in I2S TX DMA. Output is true 0V differential. No pop',
              'Shutdown sequence: lower volume gradually (ramp gain to 0 in firmware), pull SD_MODE low, then stop BCLK after 200ms soft shutdown completes',
              'TX DMA: mirror of RX ping-pong. Two TX buffers. AudioProcessor writes processed samples to inactive TX buffer, swaps on LDMA TX completion IRQ',
              'BCLK for TX = BCLK for RX (same source USART clock). Must be continuous even if TX buffer is silence',
            ],
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
            source: 'Transparency Mode Latency Analysis',
            bullets: [
              'One-way latency = time from sound entering mic to coming out speaker',
              'Dominant component: DMA block time = N_samples / sample_rate = 256/16000 = 16 ms. CPU cannot start processing until DMA block is full',
              'Queue handoff: ~1 FreeRTOS tick (1 ms). AudioProcessor must run within same tick or next',
              'DSP processing: arm_rms_f32 + arm_rfft_fast_f32(256) + gain multiply = ~1–2 ms on M4F at 38.4 MHz',
              'TX DMA start to DAC output: ~0.5 ms (MAX98357A has no internal buffer, starts immediately)',
              'Total: ~17–18 ms one-way. Round-trip (Lombard effect threshold): 35 ms — borderline perceptible',
              'Reducing latency: 128-sample blocks → 8 ms dominant, ~10 ms total. 64-sample → 4 ms. But smaller blocks = more IRQs and less DSP time per frame',
              'AirPods Pro spec: <10 ms transparency latency. Achieves <1 ms via dedicated always-on DSP chip running bare-metal, not RTOS',
              'Psychoacoustic threshold: <10 ms latency is imperceptible. 10–30 ms: slightly perceptible. >30 ms: disturbing',
            ],
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
            source: 'CMSIS-DSP & Adaptive Gain Control on M4F',
            bullets: [
              'CMSIS-DSP: ARM-optimized DSP library. Single-cycle FMAC instructions on M4F FPU',
              'arm_rms_f32(buf, N, &rms): computes root-mean-square of N float samples. O(N) with FPU vectorization',
              'arm_biquad_cascade_df1_f32(): IIR biquad filter. Each stage: 5 coefficients (b0,b1,b2,a1,a2). DF1 form maintains 2 state variables per stage',
              'arm_rfft_fast_f32(): real FFT using RFFT algorithm. N=256 real input → N/2=128 complex bins. Bin[k] represents frequency k×(Fs/N) = k×62.5 Hz',
              'FPU single-precision range: ±3.4×10^38, 23-bit mantissa (~7 decimal digits). Sufficient for audio (16-bit source data)',
              'Adaptive gain: compute frame RMS → target_gain = target_rms/current_rms → slew-limit change → apply via arm_scale_f32()',
              'Why slew limiting: abrupt gain jump by 6 dB = audible click (discontinuity in waveform amplitude). At 16ms frames, 1 dB/frame = 62.5 ms to change 4 dB — smooth',
              'Asymmetry rule: attack faster (protect ears), release slower (avoid pumping artifacts between words). Classic AGC design',
              'AudioConfig struct: protected by mutex. BLE task writes new target_level. AudioProcessor reads with mutex. Never use volatile alone for multi-word structs',
            ],
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
            source: 'FFT-Based Wind Detection — CMSIS-DSP arm_rfft_fast_f32',
            bullets: [
              'arm_rfft_fast_f32(&S, input, output, 0): forward FFT. output is N/2 complex pairs: [Re0, Im0, Re1, Im1, ...]',
              'Bin k frequency: f_k = k × (Fs/N) = k × (16000/256) = k × 62.5 Hz',
              'Low-freq bins: k=0–19 → 0–1187 Hz (speech fundamentals + first harmonics)',
              'High-freq bins: k=100–127 → 6250–7938 Hz (wind turbulence, fricatives)',
              'Wind energy ratio: high_energy / total_energy. Wind: flat broadband spectrum → ratio ~0.4–0.6. Speech: low-freq dominant → ratio ~0.1–0.2',
              'Threshold: wind_detected if ratio > 0.35 for 3 consecutive frames (hysteresis prevents chattering)',
              'Why ratio beats absolute threshold: ratio is invariant to absolute loudness. Loud speech doesn\'t trigger (ratio stays low). Quiet wind still triggers (ratio still high)',
              'Arm magnitude: arm_cmplx_mag_f32(fft_output, mag, N/2) converts complex pairs to magnitudes',
              'Energy per bin: mag[k]^2 (or just mag[k] for speed — same ordering). arm_power_f32() computes sum of squares',
              'Run FFT every 4th frame for power saving: wind changes slowly (>100ms timescale), so 64ms update rate sufficient',
            ],
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
            source: 'NVM3 — Silicon Labs Key-Value Flash Storage',
            bullets: [
              'NVM3: Silicon Labs NVM3 (Non-Volatile Memory 3) library. Key-value store with automatic wear leveling over multiple flash pages',
              'Write model: NVM3 appends new key-value records as a log. Old values invalidated (marked) but not erased immediately',
              'Wear leveling: log wraps circularly across N pages. Each page erased ~total_writes/N times. With 10 pages and 10K writes/page → 100K total NVM3 writes before any page exceeds endurance',
              'Repack (compaction): when log fills, NVM3 copies live records to new page and erases old pages. Time: N_pages × 29.5ms erase = ~150ms for 5 pages. This is the ONLY blocking operation',
              'Never call nvm3_repack() from audio task or ISR. Run from dedicated NVM3Manager task at lowest priority',
              'nvm3_open(): initialize. nvm3_writeData(h, key, data, len): write. nvm3_readData(h, key, buf, len): read. nvm3_repack(h): explicit repack trigger',
              'Keys: 20-bit values (0x00000–0xFFFFF). Reserve ranges by subsystem: BLE config 0x100–0x10F, audio settings 0x200–0x20F',
              'BLE GATT hierarchy: Profile → Service (UUID) → Characteristic (UUID, value, CCCD) → Descriptor',
              'CCCD (Client Characteristic Configuration Descriptor, UUID 0x2902): client writes 0x0001 to enable notifications, 0x0002 for indications',
              'Notification vs indication: notification = fire-and-forget. Indication = server waits for ATT confirmation ACK before next indication',
            ],
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
            source: 'EFR32BG13 Datasheet — Energy Mode Current Specifications',
            bullets: [
              'EM0 (Active, run mode): 5.5 mA typical at 38.4 MHz HFXO, DC-DC converter enabled. Peak during BLE TX: ~9 mA',
              'EM1 (Sleep, CPU halted): ~1 mA. Peripherals and DMA active. All clocks running. Entered via WFI with high-priority peripherals needing service',
              'EM2 (Deep Sleep): HFCLK gated. Only LFXO (32.768 kHz), LFRCO, ULFRCO clocks available. RTCC, LESENSE, LEUART, CRYOTIMER can run. Typical: 1.4 µA (64 kB RAM retained, RTCC from LFXO, DC-DC LP mode)',
              'EM2 SRAM retention: all 64 KB retained by default. Can power-gate unused SRAM banks to reduce further. Each 8 KB bank ~0.1 µA saved',
              'EM3 (Stop): LFXO and LFRCO also stopped. Only ULFRCO (~1 kHz, ±2%) runs. GPIO, ACMP, ADC from ULFRCO still available. Typical: ~0.6 µA',
              'EM4 Hibernate: SRAM lost, only BOD and GPIO wakeup. ~0.1 µA. EM4 Shutoff: even BOD off, <0.1 µA',
              'BLE connection timing requirement: ±50 ppm total budget (master + slave combined). LFXO = ±20 ppm → safe. ULFRCO = ±2% = ±20,000 ppm → completely unusable for BLE',
              'BLE link layer: connection interval (CI) defined in 1.25ms units. At CI=100ms with ±50ppm, timing error budget = 100ms × 100ppm = 10µs. ULFRCO drift: 100ms × 20000ppm = 2ms → missed connection event',
              'EMU_EnterEM2(true): true = restore oscillators after wakeup. FreeRTOS idle hook: call EMU_EnterEM2() when idle task runs',
            ],
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
            source: 'EFR32BG13 CMU — Clock Gating & Power Management',
            bullets: [
              'Clock gating: AND gate on clock path to peripheral. When disabled: no switching activity → zero dynamic power. Leakage current (static) remains (~nA per gate)',
              'CMU_ClockEnable(cmuClock_USART0, false): disables USART0 clock. State (registers) preserved. Re-enable is immediate (one cycle)',
              'Power gating: power switch (header/footer FET) disconnects VDD from entire power domain. All flip-flops lose state. Requires save/restore of state to retention SRAM',
              'EFR32BG13 uses clock gating in EM1 and clock domain shutdown in EM2. No application-visible power gating of individual peripherals',
              'Dynamic power: P_dyn = C × V² × f × α (α = activity factor). Clock gating sets α=0 → zero dynamic power',
              'Leakage power: P_leak = V × I_leakage. Dominant in deep sleep. Only power gating or EM4 eliminates it',
              'Current measurement: Silicon Labs Energy Profiler (Simplicity Studio). PTI connector measures actual current via AEM (Advanced Energy Monitor). Resolution: ~100 nA',
              'Expected measurement: EM0 active frame ~5 mA for 16ms, then EM2 ~1.4 µA for remainder of connection interval. Average ≈ active_fraction × 5mA + sleep_fraction × 1.4µA',
              'Peripheral power tips: disable ADC between conversions (CMU_ClockEnable), set GPIO unused pins to disabled (gpioModeDisabled), use DC-DC converter (EMU_DCDCInit)',
            ],
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
            source: 'Bootloader Architecture — CRC, Anti-Rollback, Dual-Bank',
            bullets: [
              'Bootloader location: 0x00000000 (flash start). App location: 0x00004000 (16 KB bootloader region)',
              'Image header struct: { uint32_t magic (0xDEADBEEF), uint32_t version, uint32_t length, uint32_t crc32, uint8_t hw_variant }',
              'CRC32 covers: header (minus CRC field) + entire app binary. Computed at build time by post-build script, patched into header',
              'Boot sequence: power-on → bootloader reset handler → check magic → compute CRC32 over stored image → compare with header → if match AND version≥minimum_version → jump to app',
              'Jump to app: set MSP from app vector table[0], call app reset handler at app vector table[1]. Must disable interrupts and reset peripherals first',
              'Anti-rollback: minimum_version stored in dedicated flash page (write-once). If image.version < minimum_version → reject. Increment minimum_version after security patch deployment',
              'Dual-bank: Bank A = active, Bank B = download target. OTA writes to Bank B. On reboot: bootloader verifies Bank B CRC → if pass, set active_bank flag → jump to Bank B. Power-fail safe: active bank never touched during download',
              'CRC32 implementation: polynomial 0xEDB88320 (bit-reversed IEEE 802.3). Init 0xFFFFFFFF, final XOR 0xFFFFFFFF. Always use same implementation in build tool and bootloader',
              'Debug: log rejection reason to UART/RTT before halting. Store last rejection code in retention SRAM (survives warm reset)',
            ],
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
            source: 'ARM Cortex-M4F TRM §B3.2 — Fault Status Registers',
            bullets: [
              'CFSR (Configurable Fault Status Register, 0xE000ED28): 32-bit, three sub-registers:',
              '  MMFSR (bits[7:0]): MemManage fault status. MMARVALID[7], MSTKERR[4], MUNSTKERR[3], DACCVIOL[1], IACCVIOL[0]',
              '  BFSR (bits[15:8]): BusFault status. BFARVALID[15], STKERR[12], UNSTKERR[11], IMPRECISERR[10], PRECISERR[9], IBUSERR[8]',
              '  UFSR (bits[31:16]): UsageFault status. DIVBYZERO[25], UNALIGNED[24], NOCP[19], INVPC[18], INVSTATE[17], UNDEFINSTR[16]',
              'HFSR (HardFault Status Register, 0xE000ED2C): DEBUGEVT[31], FORCED[30], VECTTBL[1]',
              'FORCED bit: HardFault escalated from lower-priority fault (MemManage/BusFault/UsageFault disabled or fault in ISR)',
              'MMFAR (MemManage Fault Address Register, 0xE000ED34): valid only when MMARVALID set',
              'BFAR (BusFault Address Register, 0xE000ED38): valid only when BFARVALID set',
              'Decoding CFSR=0x00008200: byte 1 (BFSR) = 0x82 = 0b10000010. Bit15=BFARVALID, bit9=PRECISERR → precise bus fault, BFAR is valid',
              'BFAR=0x40010000: peripheral address space. USART0 base = 0x40010000 on EFR32BG13. Fault = accessing USART0 without enabling its clock',
              'Exception frame: pushed to active stack. Frame[6] = PC at time of fault (the faulting instruction). Read via: uint32_t *frame = (uint32_t*)__get_PSP(); uint32_t pc = frame[6]',
              'In HardFault_Handler: read frame[6] for faulting PC. Disassemble at that address with arm-none-eabi-objdump -d firmware.elf | grep <pc_hex>',
              'NOCP (UsageFault): FPU instruction executed but FPU not enabled. Fix: SCB->CPACR |= (0xF << 20) in SystemInit()',
            ],
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
            source: 'EFR32BG13 WDOG + FreeRTOS Multi-Task Watchdog Pattern',
            bullets: [
              'EFR32BG13 WDOG: programmable timeout via PERSEL field (WDOG_CTRL). Values: 0=9 clocks (~0.3ms) to 15=262143 clocks (~8s) at 1 kHz ULFRCO',
              'WDOG_Feed(): write 0xCCCC then 0x3333 to WDOG_CMD register. Must be done before timeout expires',
              'WDOG lock register: once locked, configuration cannot be changed without reset. Lock in production to prevent WDOG disable by buggy code',
              'WDOG runs in EM2/EM3. Timeout in deep sleep is still counted → ensures system wakes and processes',
              'Multi-task pattern: volatile uint32_t xWatchdogBits = 0',
              'Each task calls WatchdogCheckIn(TASK_BIT) which sets its bit: xWatchdogBits |= TASK_BIT (atomic on Cortex-M)',
              'WatchdogPetter task (lowest priority, period = WDOG_timeout/2): if (xWatchdogBits == ALL_TASK_BITS) { WDOG_Feed(); xWatchdogBits = 0; }',
              'If any task fails to check in (hung, deadlocked, or crashed): xWatchdogBits never reaches ALL_TASK_BITS → petter never feeds → WDOG resets system',
              'Boot: read EMU_RSTCAUSE register. If WDOGRST bit set → log watchdog reset to NVM3 for post-mortem. EMU_RSTCAUSE is cleared on read',
              'WatchdogPetter task must be lowest priority so it only runs when all higher-priority tasks have yielded. If any task is running forever, petter starves',
            ],
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
            source: 'BLE Connection Parameters — Power Model & Latency',
            bullets: [
              'Connection Interval (CI): how often the radio wakes for a connection event. Range: 7.5ms–4000ms in 1.25ms steps',
              'Slave Latency (SL): peripheral can skip up to SL consecutive connection events without listening (saves power). Range: 0–499',
              'Supervision Timeout (ST): if no packets received for ST duration, connection drops. ST > (SL+1) × CI × 2 (required by spec)',
              'Worst-case response latency: (SL+1) × CI. With CI=500ms, SL=3: 4×500ms = 2000ms worst case (peripheral may have skipped 3 events)',
              'Notification delivery: peripheral wakes at CI boundaries. With SL=3: may sleep 4 events, so notification latency = (SL+1)×CI worst case',
              'Power model: avg_radio_current ≈ peak_current × (event_duration / CI) × (1/(SL+1)). Shorter CI = more power. SL reduces radio duty while keeping CI short for fast wakeup',
              'For audio level streaming every 500ms: CI=500ms, SL=0 (no skipping needed — have data every CI). Or CI=100ms, SL=4 for faster max latency',
              'PHY: LE 1M (1 Mbps, best compatibility), LE 2M (2 Mbps, lower latency + power), LE Coded (125kbps or 500kbps, extended range)',
              'MTU negotiation: default ATT MTU=23 bytes. Negotiate up to 247 bytes for throughput. Notification payload = MTU-3 bytes',
              'Write With Response (ATT Write Request/Response): guaranteed delivery, confirmation. Write Without Response (ATT Write Command): no ack, higher throughput',
            ],
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
            source: 'BLE GATT Notifications, CCCD & Security',
            bullets: [
              'GATT hierarchy: Profile → Service (UUID 128-bit or 16-bit) → Characteristic (UUID, properties, value) → Descriptor',
              'Characteristic properties: READ, WRITE, WRITE_NO_RESPONSE, NOTIFY, INDICATE. Must declare NOTIFY to send notifications',
              'CCCD (Client Characteristic Configuration Descriptor, UUID 0x2902): client writes 0x0001 to enable notifications. Without this write, server must NOT send notifications',
              'Silicon Labs BLE stack: sl_bt_gatt_server_send_notification(connection, characteristic, len, data). Returns SL_STATUS_NO_MORE_RESOURCE if TX buffer full',
              'CCCD is per-connection and per-bonded-device. After reconnect without rebonding, CCCD state lost unless bonded (stored in NVM)',
              'Bonding: stores LTK (Long Term Key) + CCCD state + connection parameters in NVM. Auto-reconnect uses stored LTK for re-encryption',
              'Just Works pairing: no MITM protection. PIN pairing: 6-digit passkey. OOB: pre-shared key via NFC/QR code',
              'Debugging notifications: use nRF Connect app → connect → manually write 0x01 to CCCD → watch notifications. Confirms stack works, isolates app bug',
              'MTU: if payload > MTU-3, stack returns error or silently truncates. Always check data length before calling send_notification',
              'Connection handle: changes each connection. BLE event SL_BT_EVT_CONNECTION_OPENED_ID delivers new handle. Store and validate before sending',
            ],
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
            bullets: [
              'I2C: two wires — SCL (clock, master drives) and SDA (data, open-drain bidirectional). Pull-up resistors to VDD required on both lines',
              'Open-drain: device can only pull low (drive 0) or release (float high via pull-up). Any device can hold bus low',
              'Standard speeds: 100 kHz (standard), 400 kHz (fast), 1 MHz (fast+), 3.4 MHz (high-speed)',
              'Transaction: START (SDA↓ while SCL high) → 7-bit address + R/W bit → ACK (slave pulls SDA low) → data bytes → STOP (SDA↑ while SCL high)',
              'Clock stretching: slave can hold SCL low to force master to wait. Not all masters support it',
              'Bus lockup cause: master resets mid-byte → slave still in middle of sending data byte, holds SDA low waiting for more SCL',
              'Recovery procedure: (1) configure SCL as GPIO output, SDA as GPIO input. (2) Check if SDA is high — if so, no lockup. (3) Toggle SCL 9 times (one full byte + ACK). Check SDA after each toggle. (4) SDA goes high = slave released. (5) Generate STOP condition. (6) Re-initialize I2C peripheral normally',
              'SPI: 4 wires — SCLK, MOSI (master out), MISO (master in), CS (chip select, active low). Full-duplex, push-pull (not open-drain)',
              'SPI modes — CPOL/CPHA: Mode 0 (0,0): idle low, sample on rising. Mode 1 (0,1): idle low, sample on falling. Mode 2 (1,0): idle high, sample on falling. Mode 3 (1,1): idle high, sample on rising',
              'SPI CS: must be asserted low before first SCLK edge, deasserted after last. Between transactions: CS high deselects slave',
              'EFR32BG13 USART in SPI master mode: USART_InitSync(). Set CLKPOL/CLKPHA in USART_CTRL. MSBF bit controls bit order',
            ],
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
            bullets: [
              'Single-bank OTA: erase active flash in-place, write new image. Power fail during write → bricked device with partial image. No recovery without UART bootloader',
              'Dual-bank (A/B): Bank A = currently running. Bank B = download target. Erase/write Bank B while A runs normally. Power-fail safe at any point during download',
              'Swap: bootloader reads "pending_bank" flag from NVM. On next boot: verify Bank B CRC → if pass, jump to B and mark B active. Flag write is single 32-bit word = atomic (one flash write word)',
              'Power fail during swap: bootloader re-verifies on every boot. If pending bank fails CRC, stays in Bank A. Device never bricks',
              'CRC32: fast, cheap, detects corruption. Does NOT protect against malicious injection (attacker can craft valid CRC)',
              'ECDSA-P256: signs SHA-256 hash of image with private key (kept secret at build). Device verifies with embedded public key. Cannot forge without private key',
              'Delta OTA: send only changed bytes (binary diff, e.g., bsdiff). Saves BLE bandwidth. Requires: store delta in Bank B, apply delta from Bank A→Bank B in bootloader. Complex but worthwhile for large images',
              'Anti-rollback: monotonic counter (write-once flash bits). After security fix deployment, increment counter. Bootloader rejects images with counter < stored minimum',
              'Boot counter: increment on each boot, clear after successful app initialization. If boot counter > 3 (crash loop) → bootloader reverts to previous bank',
              'Image signing tool: arm-none-eabi-objcopy → binary → sign with ECDSA → prepend header → OTA package',
            ],
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
            source: 'GPIO Trace Debug + BLE/Audio Integration',
            bullets: [
              'GPIO trace setup: PA5=LDMA IRQ (toggle on entry/exit), PA6=AudioProcessor task (set high on entry, low on exit), PA7=BLE radio IRQ, PB0=EM2 (set high before WFI, low on wakeup)',
              'Logic analyzer: 4-channel capture at 10 MHz. Reveals CPU allocation between tasks visually',
              'BLE radio IRQ priority: Silicon Labs BLE stack uses highest-priority IRQ (priority 0 on EFR32). Must NOT be masked by FreeRTOS BASEPRI',
              'configMAX_SYSCALL_INTERRUPT_PRIORITY: set to priority 16 (or 0x10 in 8-bit field with 4 bits implemented). BLE radio at priority 0 → not masked. LDMA/USART at priority 5 → can be masked in critical sections',
              'Mutex hold time: use DWT to timestamp mutex take and release. If audio task holds AudioConfig mutex for >1ms while BLE task waits → BLE throughput degraded',
              'vTaskGetRunTimeStats(): requires configGENERATE_RUN_TIME_STATS=1. Use DWT counter as run-time counter source via portCONFIGURE_TIMER_FOR_RUN_TIME_STATS macro',
              'BLE connection event: radio needs ~1-2ms of CPU for the BGAPI event processing. If audio critical section blocks for longer → radio event missed → supervision timeout risk',
              'Fix: minimize critical section duration in audio path. Use lock-free ping-pong (one writer, one reader) for audio buffer handoff — eliminates mutex entirely',
              'Lock-free buffer handoff: volatile int active_buffer. ISR writes to !active_buffer, sets active_buffer atomically. AudioProcessor always reads active_buffer. No mutex needed for this pattern',
            ],
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
            source: 'System Design Framework — 8 Dimensions',
            bullets: [
              '1. REQUIREMENTS: functional (stereo mic→speaker, BLE config, OTA), non-functional (latency <20ms, battery >6h, secure)',
              '2. HW BLOCK DIAGRAM: EFR32BG13 ← I2S → SPH0645 mic. EFR32BG13 ← I2S → MAX98357A amp. EFR32BG13 ← BLE antenna. EFR32BG13 ← Li-Po via PMIC. EFR32BG13 ← JTAG',
              '3. SW/TASK ARCHITECTURE: MicSampler (highest, blocks on LDMA IRQ queue) → AudioDSP (high, blocks on mic queue) → BLEManager (medium) → NVM3Manager (low) → WatchdogPetter (lowest) → Idle (EM2)',
              '4. DATA FLOW: LDMA→RX_BufA/B → MicQueue → AudioProcessor → TX_BufA/B → LDMA→MAX98357A. Parallel: BLE→AudioConfig (mutex protected)',
              '5. MEMORY LAYOUT: flash: bootloader@0x0, app@0x4000, NVM3 last N pages. SRAM: .data, .bss, task stacks (8 tasks × 2KB = 16KB), DMA buffers (4×1KB = 4KB), FreeRTOS heap (32KB)',
              '6. POWER BUDGET: active frame 16ms at 5.5mA + EM2 984ms at 1.4µA = avg ~100µA. BLE: ~20µA avg. Total ~120µA → 100mAh/0.12mA = ~830 hours. (Re-check with real hardware measurement)',
              '7. SECURITY: ECDSA-signed OTA images, anti-rollback counter, BLE bonding, NVM3 for secret storage, WDOG locked in production',
              '8. FAILURE MODES: power fail during OTA (dual-bank safe), flash wear (NVM3 wear leveling), deadlock (watchdog), stack overflow (mode 2 detection + hook), BLE drop (reconnect with bonding)',
            ],
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
            source: 'DWT Cycle Counter — Benchmarking on Cortex-M4F',
            bullets: [
              'DWT (Data Watchpoint and Trace): CoreSight debug block at 0xE0001000',
              'Enable DWT counter: CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk; DWT->CYCCNT = 0; DWT->CTRL |= 1;',
              'Measure: uint32_t t0 = DWT->CYCCNT; ... uint32_t cycles = DWT->CYCCNT - t0; (handles 32-bit rollover correctly)',
              'Convert to µs: cycles / (CoreClock_Hz / 1,000,000). At 38.4 MHz: cycles / 38.4',
              'Frame time budget at 16 kHz, 256 samples: 16 ms = 614,400 cycles at 38.4 MHz',
              'Typical benchmarks (38.4 MHz): arm_rms_f32(256) ~800 cycles. arm_rfft_fast_f32(256) ~8,000 cycles. arm_biquad_cascade_df1_f32(256, 2stages) ~3,000 cycles. arm_scale_f32(256) ~500 cycles',
              'arm_rfft_fast_f32 scales as O(N log N). FFT-256 vs FFT-128: ~8000 vs ~3500 cycles. Halving N saves ~56% FFT time',
              'Run FFT every 4th frame: wind changes at ~10 Hz timescale, not 62.5 Hz. Update rate 62.5/4 = 15.6 Hz is sufficient',
              'FPU instructions: single-cycle FMUL, FADD, FSQRT (~14 cycles). Ensure compiler uses FPU: -mfpu=fpv4-sp-d16 -mfloat-abi=hard. Without -mfloat-abi=hard: compiler calls soft-float library = 50–100× slower',
              'Context switch overhead: measured with DWT. Typical M4F context switch: ~100–200 cycles. At 1000 Hz tick: ~100,000–200,000 cycles/sec = 0.3–0.5% overhead',
            ],
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
            bullets: [
              'Cortex-M4F: NO data cache. CPU and DMA both access SRAM directly via AHB bus matrix. Always coherent by design. No cache maintenance needed',
              'Cortex-A (e.g., A53, A72): L1 D-cache (32–64KB), L2 cache (shared). CPU writes go to cache first (write-back mode). DRAM may be stale',
              'DMA TX problem: CPU writes buffer → data in L1 cache. DMA starts: reads DRAM → gets old data. Transmitted garbage',
              'Fix for TX: SCB_CleanDCache_by_Addr(buf, len): writes dirty cache lines to DRAM without invalidating. Then start DMA TX',
              'DMA RX problem: DMA writes new data to DRAM. CPU reads buffer → L1 cache has stale old data. CPU sees old values',
              'Fix for RX: after DMA complete, SCB_InvalidateDCache_by_Addr(buf, len): discards cache lines for that region. CPU next read fetches from DRAM',
              'Cache line size: typically 64 bytes on Cortex-A. Alignment: DMA buffers must be aligned to cache line size and sized in multiples of cache line, otherwise partial-line invalidation corrupts adjacent data',
              'Write-through vs write-back: write-through always updates DRAM → coherent for TX but slower. Write-back (default): only cleans to DRAM when evicted or explicitly flushed',
              'Apple custom silicon: likely non-coherent DMA with explicit cache maintenance, similar to Cortex-A. Understanding this is essential for audio buffer handoff on their platform',
              'M4F MPU memory attributes: mark peripheral registers as Device (no caching, no buffering). Mark SRAM DMA buffers as Normal, Non-cacheable to skip cache maintenance',
            ],
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
            bullets: [
              'Budget formula: avg_current = capacity_mAh / runtime_hours. For 7 days: 100mAh / (7×24h) = 100/168 = ~595 µA average budget',
              'Enumerate all subsystems with duty cycle: MCU_active × duty + MCU_sleep × (1-duty)',
              'BLE: connection event ~5ms at ~5mA + EM2 rest. At CI=500ms: 5ms/500ms = 1% duty. Avg: 0.01×5mA + 0.99×1.4µA ≈ 50µA + 1.4µA ≈ 51µA. With 2M PHY: shorter events → less avg',
              'Accelerometer: ADXL362 ~2µA in motion detection mode (autonomous, no MCU wakeup). MCU wakes on interrupt only',
              'HR sensor (optical PPG, e.g., MAX30101): ~1mA active, 1Hz sampling = 20ms active. Avg: 20ms/1000ms × 1mA = 20µA when running',
              'HR gating: if accel shows no motion for 10s → disable HR sensor. At 40% duty: avg HR = 0.4 × 20µA = 8µA. Saves 12µA',
              'Power budget table: BLE ~50µA, Accel ~2µA, HR ~8µA (gated), MCU base ~53µA = total ~113µA. Budget = 595µA → 5× margin. Room for display, speaker, GPS, or longer runtime',
              'Always-on architecture: dedicated low-power SoC (or MCU in EM2 with LESENSE) monitors sensors, wakes main SoC on event. Apple Watch uses dedicated sensor SoC (S-series has multiple cores)',
              'Measurement approach: Silicon Labs Energy Profiler (or Otii Arc for independent measurement). Profile each subsystem independently, then measure combined to find interactions',
            ],
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
            bullets: [
              'ANC goal: play anti-phase signal to cancel ambient noise at eardrum. Works for periodic/predictable noise (engine rumble). Limited for transients',
              'Feedforward (FF): mic outside earbud captures noise. Signal travels 2-5ms to eardrum (acoustic path). Filter has 2-5ms to compute anti-phase. Complex filter possible (more taps, better accuracy)',
              'Feedback (FB): mic inside earbud (between speaker and eardrum). Closed loop — measures residual noise. Compensates for seal variation between users. Simpler filter required (<0.5ms), more stable',
              'Hybrid: FF handles primary broadband cancellation, FB corrects seal-dependent variations. More robust than either alone',
              'FxLMS (Filtered-x Least Mean Squares): adaptive filter algorithm. Adjusts filter coefficients in real-time to minimize error signal (feedback mic). Requires secondary path model (speaker→mic transfer function)',
              'Latency requirement: feedforward path <2ms total (computation + DAC). Feedback loop <0.5ms. This is WHY FreeRTOS or any RTOS is unsuitable — requires dedicated bare-metal DSP hardware',
              'AirPods Pro uses H1 chip (later H2): dedicated ANC DSP running at high clock with fixed-latency hardware pipelines. Not software-scheduled',
              'EFR32BG13 limitation: no dedicated ANC hardware. Could implement simple fixed-coefficient feedforward in bare-metal ISR, but no adaptive algorithm in real time',
              'Our project: heuristic wind detection via FFT energy ratio is not ANC. It detects wind and reduces gain — similar to "wind noise reduction" but not cancellation',
            ],
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
            bullets: [
              'CoreSight architecture: Debug Access Port (DAP) → AHB-AP → CoreSight components (DWT, ITM, ETM, TPIU)',
              'ITM (Instrumentation Trace Macrocell): 32 stimulus ports at 0xE0000000–0xE000007C (4 bytes each)',
              'Write to ITM: ITM->PORT[0].u32 = value; — if TER bit set for that port AND TRCENA set AND debugger connected. Otherwise write is silently ignored (non-blocking)',
              'ITM FIFO: if full, write dropped (bit 0 of ITM_STIM_PORTn = 1 when ready). Typical SWO bandwidth: 400–800 KB/s at 4 MHz SWO clock',
              'Multiple ports: use port 0 for general logging, port 1 for audio frame timing, port 2 for BLE events, port 3 for error codes. J-Link SWO Viewer can filter by port',
              'DWT (Data Watchpoint and Trace): companion to ITM. Features: cycle counter (CYCCNT), 4 hardware watchpoints (address + data match), exception trace, PC sampling',
              'DWT hardware watchpoints: set address + mask + function. Triggers DebugMon exception or halts in halting debug mode. Can watch specific variable without modifying code',
              'DWT exception trace: DWT automatically records exception entries/exits to ETB (Embedded Trace Buffer) or via SWO. Shows IRQ timing without printf',
              'UART debug drawback: USART TX at 115200 baud → ~11,520 bytes/sec → one byte = ~87µs blocking. At 1.024 MHz BCLK (I2S): one byte takes time equivalent to 89 BCLK cycles. Disrupts timing',
              'SWD (Serial Wire Debug): 2-pin (SWDIO + SWDCLK) alternative to JTAG 5-pin. SWO output available on third pin. Most modern J-Link probes support SWD+SWO simultaneously',
            ],
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
            bullets: [
              '-Wall: enables most common warnings (unused vars, implicit declarations, etc.)',
              '-Wextra: additional warnings (-Wall subset + sign comparison, missing field initializers, etc.)',
              '-Wformat=2: strict printf/scanf format string checking. Catches %s with non-literal format strings (format string injection)',
              '-Wstack-usage=N: warn when a function uses more than N bytes of stack. Useful for stack sizing. N=512 is a good starting point for ISRs',
              '-fstack-protector-strong: inserts stack canary (random value) between local char arrays/pointers and saved registers. Checked on function return. -strong = applies to functions with arrays, alloca, or address-taken locals',
              '-fstack-protector-all: applies to every function. More overhead but maximum protection',
              '__stack_chk_fail: called on canary mismatch. Must be implemented (or linked from newlib). Typical: disable interrupts, log fault, trigger watchdog reset',
              'Audit checklist: (1) no magic numbers in protocol parsing (use named constants), (2) check all return values from LDMA, BLE, NVM3 APIs, (3) no malloc/free in audio path after init, (4) all shared variables accessed under mutex or with proper atomics, (5) ISR uses only volatile or FromISR APIs',
              '-Wconversion: warns on implicit type narrowing. Catches uint32_t→uint8_t truncation silently',
              'Production build flags: -O2 -g (optimized with debug info for post-mortem). Never -O0 in production — different stack usage and timing than tested code',
            ],
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
            bullets: [
              'Framing problem: how does receiver know where one packet ends and next begins?',
              'Length-prefix: prepend N-byte length field. Simple but: if length corrupted → receiver misaligned for all subsequent packets. No resync',
              'Delimiter-based: use special byte (e.g., 0x0A newline) as frame terminator. Works for ASCII. Binary problem: payload may contain the delimiter byte → false frame boundary',
              'Escape coding: define escape byte (0x7D). Replace delimiter in payload with (0x7D, delimiter XOR 0x20). Doubles size of bytes that happen to be the delimiter value. Still O(N) but variable overhead',
              'COBS (Consistent Overhead Byte Stuffing): eliminates ALL 0x00 bytes from encoded output. Algorithm: break data into runs between zero bytes. Each run is prefixed by its length+1 (pointer to next run). Maximum overhead: 1 extra byte per 254 bytes (~0.4%)',
              'COBS encoding: scan forward, count bytes until next 0x00. Write count+1, then the non-zero bytes. At end: write 0x01 (points to terminator). Append 0x00 terminator',
              'COBS decoding: read overhead byte → jump forward that many bytes → repeat until overhead=0x00. Trivially reversible',
              'Why 0x00 as delimiter: UART initializes to 0x00 (break condition). 0x00 is unambiguous. RX ring buffer scan is fast (memchr)',
              'Framing for BLE (our project): BLE ATT has its own length framing (ATT_MTU). But for UART debug port: COBS + 0x00 delimiter is best practice',
              'Real-time constraint: COBS encode must complete in <1ms for debug logging. For 256-byte frame: ~256 iterations = ~300 cycles at 38.4 MHz. Negligible',
            ],
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
            bullets: [
              'CMOS structure: N-well process creates parasitic PNP (p+/n-well/p-sub) and NPN (n+/p-sub/n-well) bipolar transistors as a silicon-controlled rectifier (SCR/thyristor)',
              'Latch-up trigger: I/O pin driven outside VDD+0.3V or below GND-0.3V while chip is powered. Forward-biases one parasitic junction, triggers SCR → low-impedance path from VDD to GND → high current, potential chip destruction',
              'Common scenario: MCU drives SPI bus while peripheral VDD not yet powered. I/O sees 3.3V MOSI but peripheral GND at 0V with VDD=0V → pin at VDD+3.3V relative to peripheral → latch-up',
              'Prevention rule: power VDD before applying signals. Power down signals before removing VDD. Use ideal diode or level shifter if rails power in different sequence',
              'Power sequencing: V_IO (3.3V logic) → V_AUD (speaker amp) → V_RF (BLE radio). Reverse on shutdown. Use PMIC sequencer or RC delay networks',
              'DVFS (Dynamic Voltage and Frequency Scaling): reduce CPU frequency → allows lower supply voltage (minimum Vdd for timing closure). P_dynamic = C × V² × f. Halving V and f: P = C × (V/2)² × (f/2) = C × V²/4 × f/2 = P/8 (8× reduction)',
              'EFR32BG13 DC-DC converter: integrated buck converter. Enable in EM0/EM1/EM2. Typical efficiency 85–90%. Without DC-DC: run from 3.6V directly. With DC-DC: internal rail ~1.8V → significant current reduction',
              'PMIC I2C communication: typically uses I2C at 400kHz. Must sequence: I2C bus must be available before sending PMIC rail commands',
              'Rails to monitor: VDDIO (I/O ring), VDDCORE (CPU core), VDDRF (radio), VDDA (ADC reference). Each has minimum/maximum spec in datasheet',
            ],
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
            bullets: [
              'Audio path real-time requirements: must complete within frame period (16ms). Any blocking call risks deadline miss → frame drop',
              'pvPortMalloc() (FreeRTOS heap_4): O(N) worst case where N = number of free blocks. After hours of alloc/free: heap fragmented → search time grows unpredictably',
              'Fragmentation scenario: alloc 1KB, free 512B, alloc 512B, free 1KB → 512B hole cannot satisfy 1KB request. Heap "full" with available space',
              'malloc() can also fail silently if heap exhausted → NULL pointer dereference in audio path → fault mid-frame',
              'No safe recovery: if audio path malloc fails, half-processed buffer in flight. Cannot cleanly restart without audible glitch or system reset',
              'Solution — static allocation: static int32_t rx_buf_a[256]; — guaranteed at compile time. Link-time size check catches overflows',
              'Solution — block pools: pvPortMalloc N fixed-size blocks at startup. Return/acquire blocks from pool. O(1) alloc/free. FreeRTOS: xStreamBufferCreate or custom ring buffer',
              'HAL principles: (1) HAL functions own all register access — no raw register writes from application, (2) named constants for all hardware values (no magic numbers), (3) all HAL functions return error codes, (4) HAL init functions called only from main before scheduler starts',
              'Module boundary enforcement: audio_hal.h exposes only: audio_hal_init(), audio_hal_get_rx_buffer(), audio_hal_release_rx_buffer(). No DMA registers, no USART registers visible outside audio_hal.c',
              'MISRA C guidelines relevant to embedded: no dynamic memory allocation (MISRA 21.3), no recursion (MISRA 17.2), all code paths return values checked, no unreachable code',
            ],
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
            bullets: [
              'EXC_RETURN: special value written to LR by hardware on exception entry. Upper bits: 0xFFFFFF__. Lower nibble encodes return context',
              'EXC_RETURN values: 0xFFFFFFF1 = Handler→MSP (nested exception), 0xFFFFFFF9 = Thread→MSP, 0xFFFFFFFD = Thread→PSP (normal FreeRTOS task)',
              'bit[2]: SPSEL. 0 = MSP was active when exception occurred. 1 = PSP was active (task context). In FreeRTOS: tasks use PSP, so HardFault from task → bit[2]=1',
              'bit[3]: 0 = FPU state was pushed (extended frame = 26 words). 1 = no FPU state (basic frame = 8 words). Wrong assumption changes frame[6] offset',
              'Exception frame layout (basic, 8 words): [0]=r0, [1]=r1, [2]=r2, [3]=r3, [4]=r12, [5]=LR, [6]=PC (return address = faulting PC), [7]=xPSR',
              'Extended frame (with FPU): same 8 words + S0–S15 (16 words) + FPSCR = 26 words total. frame[6] is still PC (offset unchanged in first 8 words)',
              'HardFault handler code: void HardFault_Handler(void) { uint32_t *frame = (uint32_t*)(__get_PSP() if LR&4 else __get_MSP()); uint32_t pc = frame[6]; // faulting PC }',
              'In assembly: MOV R0, LR; TST R0, #4; ITE EQ; MRSEQ R0, MSP; MRSNE R0, PSP; B hard_fault_handler_c',
              'Exception types: NMI (non-maskable), HardFault (catch-all), MemManage (MPU violation), BusFault (bus error), UsageFault (undefined instruction, div-by-zero, etc.)',
              'Thread vs Handler mode: Handler mode = any ISR/exception. Thread mode = normal task execution. MSP used in Handler mode by default. FreeRTOS tasks use PSP in Thread mode',
            ],
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
            bullets: [
              'CRC32 (IEEE 802.3 polynomial = 0x04C11DB7, bit-reversed = 0xEDB88320):',
              'uint32_t crc32(const uint8_t *data, size_t len) { uint32_t crc = 0xFFFFFFFF; while(len--) { crc ^= *data++; for(int i=0;i<8;i++) crc = (crc&1) ? (crc>>1)^0xEDB88320 : crc>>1; } return ~crc; }',
              'Common interview trap: LSB-first processing (right-shift). Some implementations are MSB-first (left-shift with 0x04C11DB7). Know which you\'re implementing',
              'LDMA ping-pong from memory: LDMA_Descriptor_t descA = LDMA_DESCRIPTOR_LINKREL_P2M_BYTE(&USART1->RXDATA, bufA, 256, 1); (link offset 1 = next descriptor)',
              'LDMA channel config: LDMA_TransferCfg_t cfg = LDMA_TRANSFER_CFG_PERIPHERAL(ldmaPeripheralSignal_USART1_RXDATAV);',
              'I2C bus recovery in C: GPIO_PinModeSet(SCL_PORT, SCL_PIN, gpioModePushPull, 1); for(int i=0;i<9;i++){GPIO_PinOutClear(SCL_PORT,SCL_PIN);delay_us(5);GPIO_PinOutSet(SCL_PORT,SCL_PIN);delay_us(5);if(GPIO_PinInGet(SDA_PORT,SDA_PIN)) break;} generate_stop(); I2C_Init(I2C0, &init);',
              'Sign-extend 18-bit from 32-bit I2S word: int32_t sample = (int32_t)(raw32 >> 14); if(sample & (1<<17)) sample |= ~((1<<18)-1);',
              'Practice timing: CRC32 implementation from scratch = 10 min. LDMA ping-pong setup = 15 min. I2C recovery = 10 min. If slower: repeat daily until fluent',
            ],
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
            bullets: [
              'STAR: Situation (1-2 sentences of context) → Task (your specific responsibility) → Action (what YOU did, "I" not "we") → Result (quantified outcome)',
              'Situation: be specific. "At Lucid Motors, we had 3 weeks before battery management system certification..." not "I worked on a battery project..."',
              'Task: your ownership. "I was responsible for the embedded firmware for the cell monitoring ASIC interface." Shows scope of your role',
              'Action: most important section. 3-5 concrete steps you took. Use technical terms. "I profiled with DWT, found the CAN polling loop at 78% CPU, replaced with interrupt-driven with RX FIFO — 12× reduction"',
              'Result: always quantify. "Reduced average latency from 23ms to 4ms." "Certification passed first attempt, saving 6-week retest cycle." "Patent filed as first inventor."',
              'Stories to prepare: (1) Most complex bug you debugged (I2S USART1 workaround), (2) Technical decision with uncertainty (ping-pong vs circular DMA), (3) Working cross-functionally (hardware team for mic bias issue), (4) Prioritization under pressure, (5) Something you built from scratch (EFR32BG13 project)',
              'Avoid "we" — interviewer cannot assess your contribution. "We implemented" → "I designed the descriptor chain; my colleague handled the codec"',
              'Keep each story under 3 minutes. Practice with timer. Interviewers lose attention after 3 minutes',
              '"Tell me about yourself": 90-second narrative. Current role → relevant past → why Apple. End with one sentence about EFR32BG13 project',
            ],
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
            bullets: [
              'Typical Apple firmware interview: (1) recruiter screen 30min, (2) technical phone screen 60min, (3) on-site 4-6 rounds × 45-60min each',
              'On-site breakdown: 2 technical deep-dives, 1 system design, 1 project presentation, 1-2 behavioral',
              'Project round is most critical: 20-minute presentation of your best work + 25-minute deep Q&A. Expect: "why did you choose X?", "what would you do differently?", "what is the hardest bug you hit?"',
              'Technical rounds: live coding (whiteboard or laptop), register decoding, debug scenario walkthrough. Expect: "walk me through interrupt handling", "decode this CFSR", "draw DMA descriptor chain"',
              'System design: open-ended. "Design firmware for TWS earbuds with ANC and HR monitoring." Cover all 8 dimensions. Draw block diagrams. Quantify power',
              'Behavioral: Apple uses STAR. Focus on: technical leadership, cross-functional collaboration, dealing with ambiguity, learning from failure',
              'Apple values: craftsmanship (every detail matters), customer obsession (how does this affect the user?), collaboration (work with HW, mechanical, acoustics, iOS teams)',
              'What NOT to do: (1) say "I don\'t know" and stop — say "I don\'t know exactly, but my reasoning is...", (2) claim expertise you don\'t have, (3) skip power analysis in system design, (4) ignore failure modes',
              'Prepare 3 questions per round. Never ask about salary, time off, or remote work. Ask about technical problems they\'re solving',
            ],
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
            bullets: [
              'Technical rounds: "What is the hardest real-time constraint you deal with in the audio pipeline?" / "How does the firmware interact with the H-series DSP cores?" / "What is the biggest source of audio latency variance in production?"',
              'System design round: "How do you approach bringing up firmware on a new SoC revision?" / "How does HIL (hardware-in-loop) regression testing work for AirPods?" / "What is the biggest architectural decision in the current generation?"',
              'Project round: "What does the firmware onboarding look like for a new team member?" / "How much of the codebase is shared between AirPods, Apple Watch, and Beats?"',
              'Behavioral round: "What does the career growth path look like for a senior firmware engineer at Apple?" / "How does your team handle technical disagreements between firmware and hardware?"',
              'Never ask: salary, PTO, work hours, remote policy, company stock — these are recruiter questions',
              'Never repeat the same question across rounds — interviewers compare notes',
              'End every round by asking: "Is there anything about my background or answers I should clarify?" — invites them to surface doubts you can address',
              'Application logistics: Apple Careers at jobs.apple.com. Search: "firmware AirPods", "firmware wearable", "embedded software audio". Cover letter: 3 sentences max — EFR32BG13 project + Lucid BMS patent + why Apple AirPods specifically',
              'Timeline: typical Apple hiring cycle is 4-8 weeks from application to offer. Follow up once with recruiter after 3 weeks if no contact',
            ],
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
            bullets: [
              'M33 additions over M4F: TrustZone-M (security extension), 16-region MPU (vs 8), AIRCR.BFHFNMINS (BusFault/HardFault/NMI target security state)',
              'TrustZone-M: SAU (Security Attribution Unit) partitions address space into Secure (S) and Non-Secure (NS) regions. NSC (Non-Secure Callable) = veneers for S→NS calls',
              'BLXNS instruction: branch from Secure to Non-Secure with security state switch. Only valid entry from NS to S is via NSC veneer. This prevents NS code from jumping arbitrarily into secure code',
              'AIRCR.BFHFNMINS: configures whether BusFault/HardFault/NMI are Secure or Non-Secure. If Secure, NS faults escalate to Secure HardFault',
              'Transfers from M4F: NVIC (identical register layout), SysTick (identical), PendSV (identical), DWT (same CYCCNT), ITM (same stimulus ports), FPU (single-precision identical), all fault registers (CFSR/HFSR/MMFAR/BFAR)',
              'Stack in M33: separate Secure MSP, Secure PSP, Non-Secure MSP, Non-Secure PSP — 4 stack pointers. M4F has 2 (MSP + PSP)',
              'Apple H-series chips: ARM-based (likely M33 or custom derivative) + dedicated DSP cores. The ARM core handles OS/scheduling/BLE; DSP cores handle ANC/audio pipeline with fixed latency',
              'Ramp plan for Apple: Week 1: read SAU/AIRCR documentation, setup secure/non-secure partition for test app. Week 2: explore audio DSP SDK. Week 3: shadow first code review',
            ],
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
            bullets: [
              'TrustZone-M (ARM): single physical processor with hardware-enforced Secure/Non-Secure execution states. State encoded in IPSR/CONTROL registers',
              'SAU regions: 8 programmable regions (like MPU). Each defined as Secure, Non-Secure, or NSC. Addresses not in any SAU region default to Secure (or Non-Secure depending on ALLNS bit)',
              'Secure state: full access to all memory. Non-Secure state: can only access NS regions. Attempting to access Secure memory from NS → SecureFault',
              'NSC (Non-Secure Callable): a Secure region containing BXNS veneer instructions. Only valid NS→S entry point. Prevents NS code from jumping to arbitrary secure code',
              'SAU vs MPU: SAU enforces Secure/NS partitioning. MPU enforces read/write/execute permissions within each state. Both are needed for full security',
              'Apple Secure Enclave (SEP): separate die/processor from application processor. Communicates via mailbox. Handles: Face ID biometric templates, Apple Pay keys, device encryption keys. Even if application processor is compromised, SEP remains isolated',
              'Apple Boot ROM: on-chip, immutable. Verifies LLB (Low Level Bootloader) signature with ECDSA using burned-in root key. LLB verifies iBoot. iBoot verifies XNU kernel. Each step uses ECDSA with Apple CA chain',
              'Anti-rollback: Apple uses hardware fuses. Each security version burned permanently. Cannot downgrade. Similar to monotonic counter in embedded bootloader design',
              'TrustZone limitations: (1) security depends on correct SAU configuration (software bug = full bypass), (2) side-channel attacks (cache timing, power analysis) can leak Secure data, (3) DMA engines bypass TrustZone unless also configured with security attribution',
            ],
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
            bullets: [
              'CMOS dynamic power: P = C_total × V_DD² × f × α. C = total switching capacitance, α = activity factor (fraction of gates switching per cycle)',
              'DVFS: reduce f → allows lower V_DD (less voltage margin needed for timing closure). Power ∝ V²×f: halving both → 1/4 × 1/2 = 1/8 power',
              'Example: Apple A-series at max 3.0 GHz / 1.1V. Halve to 1.5 GHz / 0.8V: power = (0.8/1.1)² × 0.5 = 0.53 × 0.5 = 26% of original = 4× reduction',
              'Firmware role: request performance state from PMIC. PMIC adjusts core voltage. Firmware then switches PLL to new frequency. Sequence: lower frequency first (safe timing), then lower voltage. Reverse on increase',
              'Transition time: voltage ramp ~50-100µs (PMIC limited). Frequency switch: 1-2µs (PLL relock). Total ~100µs → avoid switching frequently',
              'Retention SRAM: SRAM powered at reduced voltage (data retention voltage, ~0.5V) during deep sleep. State preserved at 1/4 the active leakage current. Selected banks kept alive; unused banks fully power-gated',
              'Clock domain crossing (CDC): when signals move from clock domain A to clock domain B (different frequencies), setup/hold violations → metastability',
              'Metastability: flip-flop output enters undefined state when data changes too close to clock edge. Probability of resolution failure: e^(-t/τ) where τ ~100ps for modern CMOS',
              'CDC solutions: 2-flip-flop synchronizer (for single-bit signals), handshake protocol (for multi-bit), asynchronous FIFO (for data streams, uses gray-coded read/write pointers)',
              'Firmware implication: when bridging two subsystems on different clocks (e.g., audio at 1.024 MHz from USART, BLE radio at its own clock), use hardware synchronizer or asynchronous FIFO — never just sample raw signal',
            ],
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
            bullets: [
              'Modern wearable SoC architecture: Cortex-M/A (application) + DSP core + BLE controller (Cortex-M0) + sensor hub (Cortex-M0). Each has own cache and data bus',
              'Shared SRAM: typically a dedicated SRAM bank reachable by multiple bus masters. Both cores can read/write, but cache coherency must be managed',
              'Non-cacheable attribute: MPU region covering shared SRAM marked as Normal Non-cacheable. All accesses go to SRAM directly. Coherent by hardware. Slower (no L1 benefit) but simple',
              'Software cache maintenance: if shared SRAM is cacheable — producer must SCB_CleanDCache_by_Addr before signal. Consumer must SCB_InvalidateDCache_by_Addr before read. Discipline required from all contributors',
              'Mailbox interrupts: doorbell mechanism. Core A writes to mailbox register, triggers IRQ to Core B. Core B reads mailbox to find message. Mailbox register in non-cacheable shared SRAM or in dedicated hardware register',
              'Hardware semaphores: dedicated semaphore peripheral (e.g., HSEM on STM32H7). Provides atomic test-and-set across cores without software spin-lock (spin-lock not safe across cores — no global store-exclusive monitor)',
              'Ring buffer for inter-core: write pointer (written by producer only, read by consumer). Read pointer (written by consumer only, read by producer). Full: (write+1) == read. Empty: write == read. With one producer + one consumer: lock-free',
              '__DMB() (Data Memory Barrier): ensure all memory writes are visible before proceeding. Required before writing "ready" flag that consumer polls. Without DMB: write-buffer reordering may make flag visible before data',
              'EFR32BG13: single Cortex-M4F core (no multi-core). These patterns apply when you move to Apple\'s multi-core platform',
            ],
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
            bullets: [
              'Cold test 1: Draw LDMA ping-pong descriptor chain from memory. Should take <3 min. Include: descriptor structs, link fields, channel config, peripheral signal, IRQ handler with queue post',
              'Cold test 2: Decode CFSR=0x00008200. Answer: BFSR=0x82, BFARVALID+PRECISERR, precise bus fault, check BFAR for address, check faulting PC at exception frame[6]',
              'Cold test 3: Why no EM3 with BLE? Answer: LFXO stopped in EM3, only ULFRCO (±2%) available. BLE needs ±50ppm → ULFRCO error 400× too large. EM2 keeps LFXO',
              'Cold test 4: EXC_RETURN bit[2]? Answer: 1=PSP active (task context), 0=MSP active (handler/privileged). Determines which stack has exception frame. Critical for HardFault handler',
              'Cold test 5: 3 main M33 additions over M4F? Answer: TrustZone (SAU), 16-region MPU (vs 8), 4 stack pointers (S-MSP, S-PSP, NS-MSP, NS-PSP)',
              'Cold test 6: Full audio frame path in 90 seconds? Answer: Sound→mic→USART RX FIFO→LDMA→bufA/B→IRQ→queue→MicSampler task→shift+sign-extend→AudioProcessor→RMS+FFT+gain→TX DMA→MAX98357A→speaker',
              'Pass criteria: answer all 6 cleanly without notes in <3 min each → ready for Apple interview',
            ],
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
            bullets: [
              'vApplicationTickHook(): called by SysTick ISR (xTaskIncrementTick). ISR context: no blocking, no FreeRTOS task APIs. Fast only. Use: increment global timestamp counter, toggle debug GPIO',
              'vApplicationIdleHook(): called in Idle task (lowest priority). Task context: can call task APIs that do not block (yield allowed). Use: EMU_EnterEM2(true), background statistics collection',
              'Never call vTaskDelay() or xQueueReceive(timeout) from idle hook — idle task must remain runnable for system stability',
              'configUSE_TICK_HOOK=1 and configUSE_IDLE_HOOK=1 must be set in FreeRTOSConfig.h to enable these hooks',
              'Adding stereo (second mic): second USART I2S channel → second LDMA channel → second queue. AudioProcessor receives both buffers per frame, interleaves L+R. DMA bus arbitration becomes critical',
              'DMA bus arbitration: EFR32BG13 has two DMA controllers (LDMA with 8 channels). Multiple channels share AHB bus via round-robin or priority. If two channels active simultaneously, bandwidth split. At 1.024 MHz BCLK: 32-bit word every ~1µs. Each LDMA channel consumes ~8% of AHB bandwidth for audio',
              'DMA bandwidth formula: (sample_rate × bytes_per_sample × channels) / AHB_bandwidth. At 38.4 MHz AHB, 2-channel audio: 16000×4×2 = 128KB/s / (38.4×4 MB/s) = 0.08% — no bottleneck',
              'Stereo coherency: L and R channels must be captured in sync. Use same LRCK. If captured on two separate DMA channels, they start aligned (both triggered by same LRCK rising edge)',
            ],
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
            bullets: [
              'Requirements: ANC + transparency, HR monitoring, BLE (iOS pairing + streaming), 50mAh, TWS (left+right independent MCUs with inter-earbud link)',
              'HW block diagram: 3 mics (FF outer, FB inner, transparency), 1 speaker, HR sensor (PPG+accel), BLE antenna, PMIC, inter-earbud IR/NFC link',
              'Task architecture: AudioDSP (bare-metal ISR for ANC <0.5ms), TransparencyTask (FreeRTOS, 10ms budget), HRTask (1Hz), BLEManager, PowerManager, WatchdogPetter',
              'ANC in bare-metal ISR: mic ADC triggers ISR at 48kHz. ISR: read sample, apply fixed FxLMS filter, write to DAC. Must complete in <20µs. No RTOS APIs allowed',
              'FxLMS coefficient update: once per 100ms from a FreeRTOS task (not ISR). Uses __disable_irq()/__enable_irq() to atomically swap coefficient array',
              'Inter-earbud link: proprietary 2.4GHz or NFMI (Near Field Magnetic Induction). Synchronize playback, share ANC state, relay iOS commands',
              'Power budget (50mAh): 50/24h = ~2mA avg for 1 day. Active mode (music): ~8mA × 6h = 48mAh → most budget consumed in active use. ANC off during EM2 sleep',
              'Memory layout: flash 512KB (app 256KB, OTA slot 256KB). SRAM: ANC buffers (non-cacheable, 48kHz × 32-bit × 4 = 384KB/s → ring buffer 4KB), HR buffers, BLE stack, RTOS',
              'Security: ECDSA OTA, BLE pairing with bonding, biometric data (HR) stays on device, not sent via BLE',
              'Failure modes: ANC malfunction → ISR exception → reset + disable ANC, fallback to transparency. HR sensor failure → report error via BLE, continue audio. Power fault → PMIC interrupt → graceful shutdown',
            ],
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
            bullets: [
              'Opening statement (2 min): "I built a real-time audio transparency mode on EFR32BG13 — a MEMS mic captures sound via I2S, DMA transfers 256-sample blocks, DSP applies adaptive gain and wind detection, then plays through MAX98357A speaker. BLE lets an iOS app control modes and stream audio level. Total latency: 17ms."',
              'Ping-pong vs circular DMA — why I chose ping-pong: "Circular gives no completion notification — I would need to poll for buffer half-full. Ping-pong gives deterministic IRQ at each 16ms boundary, decouples DMA from processing. Cleaner design even though slightly more complex setup."',
              'Queues vs shared memory — why queues: "FreeRTOS queue is thread-safe by construction. Shared pointer with volatile flag has data races on multi-byte update. Queue adds minimal overhead (pointer-sized message) and provides timeout/blocking semantics."',
              'Hardest bug: "USART1 I2S framing glitch on EFR32BG13. Specific CLKDIV value caused periodic LRCK misalignment. Took 2 days with logic analyzer to find. Silicon Labs KB article confirmed erratum. Workaround: specific CLKDIV value from AN."',
              'Adaptive gain artifact: "Gain tracking had 3ms latency between RMS measurement and apply. At frame boundary this caused a 3ms step in amplitude — audible click. Fixed: apply gain smoothly within frame using per-sample linear interpolation."',
              'What I would do differently: "Use hardware timer instead of DWT for benchmarking — DWT can be reset by debugger. Add CRC32 verification on DMA buffers to detect SRAM corruption under high-load. Pre-compute FFT twiddle factors in flash."',
              'Why not circular buffer: describe limitation, confirm deliberate choice, show you understand the trade-off. Never say "I didn\'t know about circular DMA" — you do, ping-pong was the right call.',
            ],
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
            bullets: [
              'Story 1 — EFR32 project (technical accomplishment): Situation: needed transparency mode under 20ms. Task: architect entire firmware stack. Action: chose ping-pong DMA (measured 125 IRQ/sec vs 32K), FreeRTOS with priority hierarchy, DWT benchmarking. Result: 17ms latency, 8hr battery, wind detection 93% accuracy on test corpus',
              'Story 2 — Lucid Motors BMS patent (innovation): Situation: cell monitoring ASIC had no published API. Task: reverse-engineer SPI protocol and implement driver. Action: logic analyzer, iterative testing, abstraction layer. Result: filed patent as first inventor, driver shipped in production BMS',
              'Story 3 — Workload reprioritization: Situation: two critical deliverables due same week. Task: prioritize with manager. Action: enumerated risk of each, proposed phased delivery, communicated dependency to stakeholder. Result: highest-risk item shipped on time, second shipped one week late with stakeholder agreement',
              'Story 4 — Decision under uncertainty: Situation: USART1 I2S behavior undefined in EFR32BG13 datasheet for our configuration. Task: ship by end of sprint. Action: built minimal test harness, tried 4 CLKDIV values, found stable config, documented, validated with 24hr soak test. Result: shipped on time, filed bug report with Silicon Labs',
              'Story 5 — Cross-functional: Situation: mic audio quality poor, unclear if hardware or software issue. Task: isolate root cause with hardware engineer. Action: I wrote diagnostic firmware logging raw I2S samples; HW engineer probed mic bias circuit. Found bias voltage 200mV low due to resistor tolerance. Result: hardware fix in rev B, software workaround for rev A units in field',
              'Behavioral prep: record each story on phone. Listen back — do you say "we"? Is result quantified? Is it under 3 minutes? Iterate until fluent',
            ],
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
            bullets: [
              'Phone screen (15 min): "Tell me about yourself" (90s). 2 technical questions (pipeline/NVIC + DMA). 1 behavioral (most complex project). Close with your question for them',
              'Technical round (45 min): intro 2 min, live coding 20 min (draw LDMA ping-pong + ISR), debug scenario 15 min (CFSR decoding, or dropped frames diagnosis), system architecture 5 min, Q&A 3 min',
              'Project round (20 min): overview 2 min, architecture walk 8 min, hardest bug 5 min, limitations 3 min, what\'s next 2 min',
              'Debrief rules: write your 3 weakest answers immediately after. Revisit the specific reading material for those topics. Practice those 3 questions cold the next morning',
              'Common weak spots: (1) forgetting CFSR field names cold → flashcard: MMFSR[7:0], BFSR[15:8], UFSR[31:16], (2) system design missing power budget → always state numbers first, (3) STAR stories drifting to "we" → record yourself',
              'Final cold tests to pass before applying: (1) Draw LDMA ping-pong from memory. (2) Decode CFSR=0x00000100. (3) Why no EM3 with BLE? (4) Full audio frame path in 90s. (5) Power budget for 6hr device. (6) One behavioral story with STAR structure in under 3 minutes',
              'Readiness signal: you can answer any question from weeks 1-10 cleanly, in under 3 min, without notes, and explain WHY for every design decision',
            ],
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
            bullets: [
              'Process: (1) Take your 3 weakest answers from mock debrief. (2) Open relevant section in this notes system. (3) Close notes. (4) Write answer from scratch on paper. (5) Open notes, compare, find gap. (6) Repeat until you write it cleanly without notes in under 3 minutes',
              'Full audio frame path (memorize verbatim): Sound → SPH0645 MEMS mic → I2S bus (BCLK 1.024MHz, LRCK 16kHz) → USART1 RX FIFO → LDMA (256-word transfer) → RX bufA or bufB → LDMA IRQ → xQueueSendFromISR(bufPtr) → MicSampler task unblocks → raw32>>14 shift + sign-extend 18-bit → Q passed to AudioProcessor → arm_rms_f32 (gain) + arm_rfft_fast_f32 (wind) → arm_scale_f32 (apply gain) → TX DMA → I2S TX → MAX98357A → speaker',
              'Parallel subsystems during same 16ms frame: BLE Manager polls event queue. NVM3Manager checks repack needed. WatchdogPetter collects bitmask. Idle task runs EMU_EnterEM2()',
              'Numbers to memorize: 256 samples / 16kHz = 16ms frame. BCLK = 1.024 MHz. LDMA IRQ rate = 62.5Hz. ISR latency = 12 cycles (no FPU). Flash endurance = 10K erase cycles. Page erase = 29.5ms. EM2 current = 1.4µA',
              'Register addresses to memorize: CFSR=0xE000ED28, HFSR=0xE000ED2C, MMFAR=0xE000ED34, BFAR=0xE000ED38, DWT_CYCCNT=0xE0001004, FPCCR=0xE000EF34, MPU_TYPE=0xE000ED90, MPU_CTRL=0xE000ED94',
            ],
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
            bullets: [
              'README structure: (1) One-sentence project description. (2) Demo GIF or screenshot. (3) Hardware requirements list. (4) Build instructions (3 commands max). (5) 3 key design decisions with brief rationale. (6) Measured results section. (7) Limitations vs production section',
              'Measured results to include: latency measurement (GPIO logic analyzer screenshot), power current trace (Energy Profiler screenshot), wind detection accuracy (test corpus %), FFT benchmark (DWT cycles)',
              '"Limitations vs Production" section is interview gold: shows you understand where real-world products go beyond your prototype. Write it as: Feature → Your implementation → Production standard → Why the gap exists',
              'Architecture diagram: use draw.io or excalidraw. Show: task boxes with priorities, arrows for queues/DMA, hardware blocks, memory regions. Export as PNG in repo',
              'Design decisions to document: (1) Ping-pong vs circular DMA — why ping-pong. (2) FreeRTOS vs bare-metal — why RTOS for this complexity. (3) 256-sample block size — latency vs CPU efficiency tradeoff',
              'ECDSA-P256 with mbedTLS: mbedtls_pk_parse_public_key(), mbedtls_pk_verify(). Public key embedded in bootloader as const array. ~16KB flash for mbedTLS subset',
              'Stereo beamforming: two mics at known spacing d. Time-delay-of-arrival → angle of incidence. Delay-and-sum: shift second channel by d×sin(θ)/c samples. Improves SNR by 3dB and adds directional pickup',
              '5-band parametric EQ: biquad filter per band (peak/notch type). Coefficients from BLE (center freq + gain + Q). arm_biquad_cascade_df1_f32() for processing. Total: 5 biquad stages, 25 coefficients',
            ],
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
            bullets: [
              'Resume bullets must answer: what did you build? what technology? what measured result? Format: [Action verb] [technology/method] → [quantified outcome]',
              'Bullet 1: "Designed LDMA ping-pong DMA pipeline for real-time I2S audio capture on EFR32BG13, achieving 17ms end-to-end transparency latency at 62.5 IRQ/sec (vs 32,000 IRQ/sec interrupt-driven)"',
              'Bullet 2: "Implemented adaptive gain control and FFT-based wind noise detection (CMSIS-DSP) within 16ms FreeRTOS frame budget; benchmarked via DWT cycle counter at <4ms DSP overhead"',
              'Bullet 3: "Architected CRC-verified OTA bootloader with dual-bank flash layout and anti-rollback; designed multi-task watchdog with per-task bitmask liveness monitoring"',
              'LinkedIn skills to add: FreeRTOS, LDMA/DMA, I2S, ARM Cortex-M4F, CMSIS-DSP, BLE GATT, Silicon Labs EFR32, NVM3, EM2 Power Management, ITM/SWO Debug, GNU ARM toolchain, Linker Scripts',
              'Cover letter (3 sentences max): "I built a working transparency mode prototype on EFR32BG13 — real-time I2S audio, LDMA ping-pong DMA, adaptive DSP, and BLE control — specifically to prepare for this role. My Lucid Motors firmware experience (BMS patent, embedded C) grounds my RTOS and hardware knowledge. I want to apply these skills on AirPods where the constraints are orders of magnitude harder."',
              'Non-technical explanation: "I built prototype AirPods transparency mode. A tiny microphone captures outside sound, a microchip processes it in 17 milliseconds, and plays it in your ear so you hear the world around you while listening to music. Bluetooth lets a phone app control the mode."',
            ],
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
            bullets: [
              'Apple timeline: recruiter review 2-4 weeks, phone screen scheduling 1-2 weeks. Total 4-8 weeks before first contact is normal. Do not panic before week 6',
              'Backup companies to apply simultaneously: (1) Google Wearables (Pixel Buds team), (2) Bose (noise cancelling firmware), (3) Qualcomm CSRA68100 audio SoC team, (4) Beats by Dre (owned by Apple — different hiring pipeline), (5) Amazon Lab126 (ANC headphone work)',
              'H-1B consideration: Apple sponsors H-1B. Confirm role is eligible before accepting. Apple files in April lottery. If lottery missed, earliest start = October following year. Plan timeline accordingly',
              'LinkedIn outreach: find Apple firmware engineers (search "Apple firmware AirPods"). Connect with note: "I built an EFR32BG13 transparency mode — would love your perspective on the space." Do not ask for referral immediately',
              'Follow-up email (week 4): one sentence to recruiter: "I wanted to follow up on my application for [role ID]. I recently [added ECDSA OTA / added stereo support] to my project and wanted to share the update. Still very interested." Attach GitHub link',
              'Project improvement loop: while waiting, add one meaningful feature per week. Each addition = new follow-up hook. ECDSA OTA → stereo → EQ → live audio streaming via BLE → power measurement results',
              'Rejection handling: if rejected, wait 6 months before reapplying. Ask recruiter for feedback (rarely given but worth asking). Use rejection to identify gaps. Same team may re-open role',
            ],
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
            bullets: [
              'Test 1 — LDMA ping-pong: Draw from memory. Include descriptor structs, link fields, peripheral signal, IRQ with queue post. Target: <3 min, no notes',
              'Test 2 — CFSR decode: CFSR=0x00008200. Answer: BFSR=0x82, bits: BFARVALID[15]+PRECISERR[9]. Precise bus fault. Check BFAR. Find faulting PC at exception_frame[6]. Target: <60 sec',
              'Test 3 — EM3 + BLE: "EM3 stops LFXO. BLE needs ±50ppm. ULFRCO=±2%=±20,000ppm — 400× too inaccurate. Must stay in EM2 to keep LFXO running for BLE connection timing." Target: <30 sec',
              'Test 4 — EXC_RETURN: "Bit[2]: SPSEL. 1=PSP active (task context). 0=MSP active. In FreeRTOS tasks: bit[2]=1. HardFault from task: read PSP for frame, frame[6]=faulting PC." Target: <60 sec',
              'Test 5 — M33 over M4F: "Three additions: (1) TrustZone/SAU — Secure/Non-Secure partitioning. (2) 16-region MPU vs 8. (3) 4 stack pointers: Secure-MSP, Secure-PSP, NS-MSP, NS-PSP." Target: <45 sec',
              'Test 6 — Full audio path: "Sound→mic→I2S→USART RX FIFO→LDMA→bufA/B→IRQ→queue→MicSampler→shift+sign-extend→AudioProcessor→RMS+FFT+gain→TX DMA→MAX98357A→speaker. 17ms latency." Target: <90 sec',
              'Pass all 6 cleanly → you are ready. The difference between candidates: you built it, measured it, hit real bugs, and can explain every layer. That is what Apple is looking for.',
            ],
          },
        ],
      },
    ],
  },
];

export default interviewPrepData;
