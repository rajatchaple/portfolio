// Tiering layer over interviewPrepData.
// Goal: replace "study all 60 in order" with "crush the right 20, then expand."
// Map each question ID to a tier; UI filters/sorts by this.
//
// Tier 1 — Must crush. Apple WILL ask. Answer cold, on a whiteboard.
// Tier 2 — Strong pass. Project depth + breadth. Solid-but-not-perfect is OK.
// Tier 3 — Read once. Bonus credibility. Don't over-invest.
// Tier 4 — Meta. Behavioral, narratives, application logistics. One focused week.

export const tiers = {
  // Tier 1 — must-crush
  w1d1: 1,
  w1d2: 1,
  w1d3: 1,
  w1d4: 1,
  w1d5: 1,
  w1d6: 1, // const volatile + stack growth (gap-fill)
  w2d1: 1,
  w2d2: 1,
  w2d3: 1,
  w2d4: 1,
  w2d5: 1,
  w2d6: 1, // process vs thread vs FreeRTOS task (gap-fill)
  w3d1: 1,
  w3d2: 1,
  w3d3: 1,
  w5d1: 1,
  w5d4: 1,
  w5d5: 1,
  w6d3: 1,
  w8d1: 1,
  w8d5: 1,
  w9d1: 1,

  // Tier 2 — 20 questions
  w3d4: 2,
  w3d5: 2,
  w4d1: 2,
  w4d2: 2,
  w4d3: 2,
  w4d4: 2,
  w4d5: 2,
  w5d2: 2,
  w5d3: 2,
  w6d1: 2,
  w6d2: 2,
  w6d4: 2,
  w6d5: 2,
  w6d6: 2, // USB + HID class (gap-fill)
  w7d1: 2,
  w7d2: 2,
  w7d4: 2,
  w7d6: 2, // state machine design patterns (gap-fill)
  w8d2: 2,
  w8d3: 2,
  w8d4: 2,
  w8d6: 2, // unit testing in embedded (gap-fill)
  w8d7: 2, // schematic literacy + HW co-design (gap-fill)
  w9d2: 2,

  // Tier 3 — 9 questions
  w7d3: 3,
  w7d5: 3,
  w10d1: 3,
  w10d2: 3,
  w10d3: 3,
  w10d4: 3,
  w10d5: 3,
  w11d2: 3,
  w11d3: 3,

  // Tier 4 — 11 questions
  w9d3: 4,
  w9d4: 4,
  w9d5: 4,
  w11d1: 4,
  w11d4: 4,
  w11d5: 4,
  w11d6: 4, // behavioral: disagreement with hardware engineer (gap-fill)
  w12d1: 4,
  w12d2: 4,
  w12d3: 4,
  w12d4: 4,
  w12d5: 4,
};

export const tierMeta = {
  1: {
    label: 'T1',
    name: 'Must crush',
    description: 'Apple WILL ask. Answer cold on a whiteboard. No notes.',
    color: '#f87171',
  },
  2: {
    label: 'T2',
    name: 'Strong pass',
    description: 'Domain depth + project specifics. Solid — not necessarily perfect.',
    color: '#facc15',
  },
  3: {
    label: 'T3',
    name: 'Read once',
    description: 'Bonus credibility if asked. Skim. Do not over-invest.',
    color: '#94a3b8',
  },
  4: {
    label: 'T4',
    name: 'Meta',
    description: 'Behavioral, narratives, logistics. Collapse to one focused week.',
    color: '#a78bfa',
  },
};

// Hands-on exercises that cement the concept beyond memorization.
// Concrete, testable on real hardware (Nucleo, EFR32, Pico, ESP32) or QEMU.
// Every Tier 1 has practical work; pick the most insightful for Tier 2.
export const practical = {
  w1d1: {
    exercises: [
      'On paper, sketch the stack frame immediately after IRQ entry. Label SP and every offset (SP-4 ... SP-32) with the right register name.',
      'On any Cortex-M dev board: set a breakpoint in SysTick_Handler, inspect MSP in the debugger, confirm push order matches xPSR / PC / LR / r12 / r3-r0.',
      'Compute IRQ latency in nanoseconds at 38.4 MHz for: baseline 12 cycles, FPU lazy stacking worst case 24 cycles. Show the math.',
    ],
    drill:
      'Close the notes. Whiteboard the full path "IRQ asserts → first ISR instruction" in under 2 minutes.',
  },
  w1d2: {
    exercises: [
      'Wire a button to a GPIO. Configure as input with pull-up + falling-edge interrupt. Toggle an LED in the handler. Confirm on scope.',
      'Inside that handler, call printf("hi\\n"). Have main() also call printf in a loop. Watch the output garble.',
      'Fix it: handler sets a flag and returns. Main polls the flag and prints. Confirm output is clean.',
    ],
    drill:
      'Explain to a rubber duck: why is malloc() forbidden in an ISR? Use the word "deadlock" exactly once.',
  },
  w1d3: {
    exercises: [
      'Read SystemCoreClock at boot. Switch the active oscillator HFRCO → HFXO via CMU. Confirm SystemCoreClock updates.',
      'Compute USART CLKDIV by hand: CLKDIV = 256 × (38.4M / 115200 − 1). Verify against what USART_BaudrateAsyncSet() actually writes.',
      'Drop into EM2 with an RTCC wakeup. Measure current with a DMM in series. You should see µA-range — not mA.',
    ],
    drill: 'In one sentence, why does BLE require HFXO and not HFRCO? Use the word "ppm".',
  },
  w1d4: {
    exercises: [
      'Configure MPU region 0 covering your stack with the XN bit set. Trigger PC into the stack via a function pointer to a stack buffer. Verify MemManage fires.',
      'Read CFSR after the fault. Decode which flag fired (IACCVIOL? DACCVIOL?) by hand against the ARM bit definitions.',
    ],
    drill:
      'From memory, sketch the 4 GB Cortex-M memory map. Mark SRAM, peripheral, PPB, and code regions with their base addresses.',
  },
  w1d5: {
    exercises: [
      'Open your linker .ld file. Find .data — identify LMA (load address in flash) and VMA (run address in SRAM).',
      'Trace the startup .S file: find the loop that copies .data from flash to SRAM. Read every line.',
      'Add a global initialized variable. Confirm via objdump it lives in flash AND has SRAM space allocated.',
    ],
    drill: 'Explain LMA vs VMA in one sentence. Why does .bss need only one address?',
  },
  w1d6: {
    exercises: [
      'Declare `const volatile uint32_t * const status_reg = (uint32_t *)0x40000000U;`. Try to write `*status_reg = 1;` — compiler should reject it. Read it in a loop — compiler must emit a load each time.',
      'Implement the stack-direction detector from coding problem c26 on your board. Run it. On Cortex-M you should get -1 (grows down).',
      'Look at the linker .ld for `_stack_start` / `_stack_end`. Confirm with a small program that printing &local matches your detector\'s direction.',
    ],
    drill:
      'What does `volatile const uint32_t *p` mean? Walk through reads vs writes the compiler will or won\'t emit.',
  },
  w2d1: {
    exercises: [
      'Erase a flash sector. Read it back — should be all 0xFF. Now write 0xAA. Read back — confirm.',
      'Without erasing, write 0x55 to that same address. What do you read back? Why?',
      'Look up your flash sector erase time. How long does it block the CPU? Could you do it during an audio ISR?',
    ],
    drill:
      'Why can flash bits go 1→0 but not 0→1 without erase? Trace it to floating-gate physics in one sentence.',
  },
  w2d2: {
    exercises: [
      'Create a FreeRTOS project with two tasks: blink LED at 1 Hz, print heartbeat at 0.5 Hz. Verify both run.',
      'Set configTOTAL_HEAP_SIZE absurdly small (e.g. 512 bytes). Spawn tasks until xTaskCreate fails. Inspect the return code.',
      'Hook vApplicationMallocFailedHook. Confirm it fires when heap is exhausted.',
    ],
    drill:
      'Walk through what happens when xTaskCreate is called and the heap is full. Where does it return, who handles it?',
  },
  w2d3: {
    exercises: [
      'Create three tasks at priorities 1, 2, 3. Log start time of each via xTaskGetTickCount. Confirm priority-3 always runs first.',
      'Inside priority-3 task, vTaskDelay(100). Observe priority-2 runs during the delay window.',
    ],
    drill:
      'Sketch the FreeRTOS ready list. Three tasks at priorities 1, 2, 3 — which runs and why?',
  },
  w2d4: {
    exercises: [
      'Create a queue, two producers, one consumer. Send and receive integers — log the order they arrive.',
      'Protect a shared counter with a mutex. Try without it first — observe corruption with tasks racing.',
      'Reproduce classic priority inversion: low task holds mutex, high task waits, medium task starves both. Then enable mutex priority inheritance — confirm it resolves.',
    ],
    drill:
      'Explain priority inversion in 30 seconds. Why does Mars Pathfinder come up in this discussion?',
  },
  w2d5: {
    exercises: [
      'Enable configCHECK_FOR_STACK_OVERFLOW = 2. Hook vApplicationStackOverflowHook.',
      'Spawn a task with a tiny stack (128 words). Recurse deeply until the hook fires.',
      'Use uxTaskGetStackHighWaterMark to right-size every task: high-water + 64 words headroom.',
    ],
    drill:
      'How can mode-2 stack overflow detection still miss an overflow? Hint: write pattern, large local array.',
  },
  w2d6: {
    exercises: [
      'Spawn 3 FreeRTOS tasks. Print xTaskGetCurrentTaskHandle and the address of a local in each. Observe each task has its own stack.',
      'Open tasks.c in FreeRTOS source. Find the TCB struct. Identify: stack pointer, priority, state, list pointers. That is the minimum a "thread" needs to context-switch.',
      'Now contrast: a Linux thread has its own kernel stack + signal mask + thread-local storage on top of all that. Sketch the difference on paper.',
    ],
    drill:
      'In one sentence each: what does a process give you, what does a thread give you, what does a FreeRTOS task give you?',
  },
  w3d1: {
    exercises: [
      'Set up an LDMA channel: memory-to-memory copy of a 256-byte buffer. Verify destination matches source byte-for-byte.',
      'Add a completion interrupt. Confirm ISR fires after transfer.',
      'Time memcpy() in a tight loop vs LDMA for the same buffer using DWT cycle counter. Compute speedup.',
    ],
    drill: 'When would you NOT use DMA? Name two scenarios.',
  },
  w3d2: {
    exercises: [
      'Configure UART RX with two ping-pong buffers. While buffer A fills, main processes buffer B.',
      'Stream continuous data at 115200 baud for 60 s. Confirm zero bytes dropped.',
      'Now do the same with byte-at-a-time RX interrupt. Note CPU cost difference under DWT.',
    ],
    drill:
      'Calculate the IRQ rate for I2S audio at 48 kHz × 2 ch × 32-bit per sample. Explain why interrupt-per-sample is unworkable.',
  },
  w3d3: {
    exercises: [
      'Toggle SCB->FPCCR.LSPEN. Measure ISR latency with DWT both ways. Quantify the difference in cycles.',
      'Inside an ISR, deliberately do a float operation. With LSPEN=1, observe FP regs get pushed retroactively.',
    ],
    drill: 'When would you DISABLE FPU lazy stacking? What do you trade?',
  },
  w5d1: {
    exercises: [
      'Enter EM2 from main(). Wake on RTCC. Measure current with a DMM. Should be ~1.4 µA on EFR32BG13.',
      'Try EM3. Note what stops working (LFXO is gone). If you have BLE running, confirm timing breaks.',
    ],
    drill:
      'Build the EM0–EM4 table from memory: which clocks survive, which peripherals work, typical current.',
  },
  w5d4: {
    exercises: [
      'Deliberately trigger HardFault three ways: NULL deref, unaligned LDM, divide-by-zero (with DIV_0_TRP=1).',
      'In HardFault_Handler, dump CFSR, HFSR, BFAR, MMFAR. Decode by hand against the ARM manual.',
      'Walk the stacked PC value. Open the .map file, find which function it points to.',
    ],
    drill: 'CFSR=0x00008200, BFAR=0x40010000. What failed? Answer in one sentence.',
  },
  w5d5: {
    exercises: [
      'Configure WDOG with 2 s timeout. Forget to kick it. Confirm reset at ~2 s.',
      'Implement multi-task watchdog: each critical task sets its bit in a global mask, kicker task confirms all bits set every period before kicking WDOG. Any bit missing → no kick → reset.',
    ],
    drill: 'Why is a single global heartbeat insufficient for a multi-task watchdog?',
  },
  w6d3: {
    exercises: [
      'Bring up I2C to a real device (LIS3DH, BMP280, anything you have). Read its WHO_AM_I register.',
      'Force the bus stuck: hold SDA low manually with a wire. Implement the 9-clock SCL recovery procedure.',
      'Bring up SPI to a flash chip (W25Q, AT25). Read JEDEC ID.',
    ],
    drill: 'Why does I2C need an SDA-stuck recovery procedure but SPI does not?',
  },
  w8d1: {
    exercises: [
      'Configure ITM channel 0. Use ITM_SendChar in code. Stream via SWO at 4 MHz to your debugger console.',
      'Inside an ISR, call ITM_SendChar. Compare ISR runtime against UART printf using DWT.',
    ],
    drill: 'Why is ITM/SWO better than UART for timing-critical traces? Give two reasons.',
  },
  w8d5: {
    exercises: [
      'Audit your codebase for malloc/free in the audio path post-init. Convert one hotspot to a static pool allocator.',
      'Pre-allocate ALL FreeRTOS objects (queues, tasks, semaphores) at boot. Set configSUPPORT_DYNAMIC_ALLOCATION = 0. Confirm system still runs.',
    ],
    drill:
      'Why is dynamic allocation forbidden in the audio path AFTER init but allowed during init?',
  },
  w9d1: {
    exercises: [
      'In your HardFault_Handler, read LR (= EXC_RETURN). Decode bit [3] (PSP/MSP) and bit [2] (Thread/Handler).',
      'Branch on EXC_RETURN: if PSP, dump the FreeRTOS task name. If MSP, dump the kernel state.',
    ],
    drill:
      'Why does HardFault_Handler need EXC_RETURN to find the right stack? What goes wrong if you guess MSP?',
  },

  // Selected Tier 2 practicals — high-leverage hands-on
  w3d4: {
    exercises: [
      'Configure I2S clocks for 16 kHz stereo, 32-bit frames. Compute BCLK and LRCLK by hand. Confirm with scope.',
      'Wire an SPH0645 or ICS-43434 mic. Capture one frame via DMA. Dump the raw 32-bit words via UART.',
    ],
    drill: 'Calculate BCLK for 16 kHz × 2 ch × 32-bit. What is the ratio of BCLK to LRCLK?',
  },
  w5d3: {
    exercises: [
      'Compute CRC32 over your firmware image at build time (post-link script). Pad it into a known location.',
      'In bootloader, recompute CRC32 on flash content. Compare. On mismatch, refuse to boot.',
    ],
    drill: 'Why CRC32 and not a checksum? Why not SHA-256 here?',
  },
  w6d4: {
    exercises: [
      'Lay out two flash banks: A (running) and B (staging). Implement OTA: download to B, mark B valid, set boot pointer to B, reset.',
      'Power-cycle in the middle of writing B. Confirm A still boots cleanly.',
    ],
    drill:
      'Why is dual-bank OTA preferred over single-bank? What is the failure mode of single-bank?',
  },
  w7d2: {
    exercises: [
      'Wrap your audio frame processing in DWT cycle reads. Compute % CPU at the audio frame rate.',
      'Profile the top 3 functions by cycles. Pick one and optimize. Re-measure.',
    ],
    drill: 'How do you compute % CPU from a DWT cycle count and a frame period?',
  },
  w9d2: {
    exercises: [
      'Implement CRC32 in pure C, no lookup table, polynomial 0xEDB88320. Test against a reference.',
      'Now implement the 256-entry table version. Time both. Quantify speedup.',
    ],
    drill: 'Whiteboard CRC32 (no table) from memory in 5 minutes.',
  },
};
