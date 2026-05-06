// MCQ data for Quick Mode (low-focus / commute practice).
// Plain flashcards reuse the existing referenceAnswer, no extra data needed.
// MCQs require careful distractors — only added where they discriminate real understanding.

export const mcq = {
  w1d1: {
    question:
      'On Cortex-M4F, when an interrupt fires, which registers does the hardware push automatically?',
    options: [
      'All 16 general-purpose registers (r0–r15)',
      'xPSR, PC, LR, r12, r3, r2, r1, r0',
      'Only the callee-saved set (r4–r11)',
      'Only PC and LR',
    ],
    correct: 1,
    explanation:
      '8 caller-saved registers per AAPCS: xPSR, PC, LR, r12, r3, r2, r1, r0. Callee-saved (r4–r11) must be pushed by the ISR itself if used.',
  },
  w1d2: {
    question: 'Why is malloc() unsafe to call inside an ISR?',
    options: [
      'It is too slow to fit interrupt latency budgets',
      'It can return NULL on heap exhaustion',
      'It takes a global heap lock — if main was mid-malloc, ISR deadlocks waiting for it',
      'It triggers a HardFault on the M4F',
    ],
    correct: 2,
    explanation:
      'dlmalloc uses a single global lock. If main holds the lock when an IRQ fires and the ISR also calls malloc, the ISR spins on a lock that will never release. System hangs until WDOG resets it.',
  },
  w1d3: {
    question: 'Why does BLE require HFXO (38.4 MHz crystal) rather than the internal HFRCO?',
    options: [
      'HFXO is faster than HFRCO',
      'HFRCO does not support 38.4 MHz',
      'BLE timing budget is ±50 ppm — HFRCO at ±2.5% (25,000 ppm) misses every connection event',
      'HFXO uses less power than HFRCO',
    ],
    correct: 2,
    explanation:
      'BLE connection events must be timed within ±50 ppm. HFRCO is 500× too inaccurate. The BLE radio sequencer auto-switches HFRCO→HFXO before each radio event.',
  },
  w1d4: {
    question: 'Cortex-M4F MPU has 8 regions. What is the XN bit for?',
    options: [
      'Marks a region as cacheable',
      'Marks a region as Execute Never — fetch from it triggers MemManage fault',
      'Disables the region',
      'Excludes the region from DMA access',
    ],
    correct: 1,
    explanation:
      'XN = Execute Never. Mark stack/heap as XN — any PC fetch from those regions triggers MemManage. Catches buffer-overflow exploits and corrupted function pointers.',
  },
  w1d5: {
    question: 'In a typical embedded linker script, .data has both an LMA and a VMA. Why?',
    options: [
      'LMA is for ROM, VMA is for RAM — but they are always equal',
      'LMA is where the initial values live in flash; VMA is where the variables run in SRAM. Startup copies LMA→VMA',
      'LMA is for big-endian, VMA is for little-endian',
      'LMA is the linker output; VMA is the virtual memory address used by an MMU',
    ],
    correct: 1,
    explanation:
      'Initialized globals must persist across reset → live in flash (LMA). They must be writable at runtime → run from SRAM (VMA). Startup .S copies LMA→VMA. .bss only needs VMA (zero-initialized).',
  },
  w2d1: {
    question: 'Flash bits can transition 1→0 freely, but 0→1 requires an erase. Why?',
    options: [
      'It is a software limitation in the flash controller',
      'Programming injects electrons onto the floating gate (1→0); erase is the only way to remove them via FN tunneling',
      'Flash controllers are write-only',
      'It depends on the silicon vendor — some flash supports 0→1 writes',
    ],
    correct: 1,
    explanation:
      'NOR flash floating-gate physics: programming injects charge (1→0). Removing charge requires high-voltage Fowler-Nordheim tunneling, which only works on whole sectors at once. This drives wear-leveling design.',
  },
  w2d2: {
    question:
      'You configured configTOTAL_HEAP_SIZE = 4096 and call xTaskCreate() — it returns errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY. What happens next if you ignore it?',
    options: [
      'The task runs but slowly',
      'The task does not exist; calling its API later is undefined behavior, often a HardFault on a bad task handle',
      'FreeRTOS automatically grows the heap',
      'The scheduler refuses to start',
    ],
    correct: 1,
    explanation:
      'xTaskCreate failure means no task was created. Hooking vApplicationMallocFailedHook is the discipline — surface it loudly at boot, do not let it silently soft-fail.',
  },
  w2d3: {
    question:
      'Three FreeRTOS tasks at priorities 1, 2, 3 — all ready. Task 3 calls vTaskDelay(100). What runs during the delay?',
    options: [
      'Task 3 keeps running for 100 ticks',
      'Task 2 runs; Task 1 only runs if Task 2 also blocks',
      'All three round-robin within the delay',
      'The idle task runs because vTaskDelay yields the CPU entirely',
    ],
    correct: 1,
    explanation:
      'vTaskDelay blocks Task 3 → highest ready is Task 2 → it runs. Task 1 only gets the CPU if Task 2 blocks too. Idle runs only when nothing is ready.',
  },
  w2d4: {
    question:
      'Classic priority inversion: low task L holds mutex, high H waits, medium M is ready. Why does H starve?',
    options: [
      'Mutexes are unfair on FreeRTOS',
      'M preempts L, blocking L from finishing — L cannot release the mutex H needs, so H waits indefinitely',
      'H has lower priority than its priority number suggests',
      'FreeRTOS schedules by FIFO order, not priority',
    ],
    correct: 1,
    explanation:
      'L cannot make progress because M preempts it. L cannot release the mutex. H waits. Mars Pathfinder hit this. Fix: priority inheritance — L is temporarily promoted to H\'s priority while holding the mutex.',
  },
  w2d5: {
    question:
      'configCHECK_FOR_STACK_OVERFLOW = 2 paints a 16-byte pattern at the stack bottom and checks it on context switch. How can it still miss an overflow?',
    options: [
      'It cannot — mode 2 is exhaustive',
      'A large local array (e.g. char buf[2048]) can write *past* the painted bytes without touching them, then return cleanly',
      'It only runs in debug builds',
      'It only catches MSP overflows, not PSP',
    ],
    correct: 1,
    explanation:
      'The painted pattern is 16 bytes at the stack bottom. A local array bigger than the remaining stack can write past it without disturbing the pattern, corrupt the previous task\'s stack, then unwind. Use MPU stack guard regions for true protection.',
  },
  w3d1: {
    question: 'When is DMA the wrong choice?',
    options: [
      'For block transfers larger than 1 KB',
      'When the data depends on per-byte CPU logic (e.g. parsing) — DMA cannot branch',
      'When using FreeRTOS',
      'When transferring between two peripherals on the same bus',
    ],
    correct: 1,
    explanation:
      'DMA is dumb: it moves bytes, it cannot make decisions. Parsing protocols, conditional copying, or anything per-byte logic stays on the CPU. DMA shines on bulk transfers where every byte goes the same place.',
  },
  w3d3: {
    question: 'FPU lazy stacking (LSPEN=1) is enabled by default on M4F. What is the trade-off?',
    options: [
      'Saves cycles on most ISRs (no FP push), but worst case +12 cycles if the ISR uses FPU and gets retroactive push',
      'Halves overall ISR latency unconditionally',
      'Required for FreeRTOS — disabling it crashes the kernel',
      'Only matters when running double-precision math',
    ],
    correct: 0,
    explanation:
      'Lazy stacking reserves space but defers FP-register push until the ISR actually touches FPU. Most ISRs do not, so they pay zero cost. Disable it (LSPEN=0) only if your latency budget needs the worst case bounded.',
  },
  w5d1: {
    question: 'Why can\'t EFR32BG13 run BLE in EM3?',
    options: [
      'EM3 disables the radio',
      'EM3 turns off LFXO; BLE needs the 32.768 kHz reference to time connection events to ±50 ppm',
      'EM3 disables interrupts',
      'EM3 is a non-functional energy mode',
    ],
    correct: 1,
    explanation:
      'EM2 keeps LFXO running — BLE wakes from EM2 for each connection event using LFXO as the timing reference. EM3 kills LFXO and falls back to ULFRCO (~1 kHz, ±2%) — way out of BLE\'s timing budget.',
  },
  w5d4: {
    question: 'You hit HardFault. CFSR = 0x00008200, BFAR = 0x40010000. What failed?',
    options: [
      'Stack overflow on the PSP',
      'BusFault on a precise data access to address 0x40010000 (a peripheral region)',
      'MemManage from execute-never violation',
      'UsageFault from divide-by-zero',
    ],
    correct: 1,
    explanation:
      'CFSR bit 15 (BFARVALID) + bit 9 (PRECISERR) set → precise BusFault, BFAR is valid. 0x40010000 is in the peripheral region — likely accessed a peripheral whose clock was not enabled, or stale pointer into peripheral space.',
  },
  w6d3: {
    question: 'I2C bus is hung — slave is holding SDA low. What\'s the recovery procedure?',
    options: [
      'Reset the master\'s I2C peripheral',
      'Toggle SCL up to 9 times manually as GPIO until SDA releases, then send a STOP',
      'Send 0xFF on SDA',
      'Power-cycle the slave',
    ],
    correct: 1,
    explanation:
      'A slave can hold SDA low if it was mid-byte when the master glitched. Bit-bang up to 9 SCL clocks (worst case 8 data bits + ACK) to let the slave finish, then issue a manual STOP. SPI doesn\'t need this — it has no acknowledge phase.',
  },
  w8d1: {
    question: 'Why is ITM/SWO better than UART printf for timing-critical traces?',
    options: [
      'ITM is encrypted',
      'ITM writes are single-cycle stalls into a hardware FIFO — no busy-wait on UART TX register, runs at debug-clock speed',
      'ITM is bidirectional, UART is one-way',
      'ITM works without a debugger attached',
    ],
    correct: 1,
    explanation:
      'A 1-byte ITM_SendChar is a single store to a memory-mapped FIFO. UART putc busy-waits hundreds of cycles. ITM is safe to use inside ISRs without distorting timing. SWO clocks at MHz rates regardless of UART baud.',
  },
  w8d5: {
    question:
      'Why is dynamic allocation forbidden in the audio path AFTER init but allowed during init?',
    options: [
      'Init is single-threaded so heap is safe; runtime is multi-threaded with deterministic budgets where malloc can fragment, fail, or block',
      'malloc is always forbidden, the question is wrong',
      'Init code is in flash, runtime code is in RAM',
      'malloc only works at boot',
    ],
    correct: 0,
    explanation:
      'At init: one context, plenty of time, no real-time guarantees needed. At runtime in audio: every frame has a hard deadline, malloc fragmentation can drop a frame, and heap can run out. Pre-allocate everything at init, use static pools after.',
  },
  w9d1: {
    question: 'In HardFault_Handler, you read LR (= EXC_RETURN). Why?',
    options: [
      'To know which IRQ fired',
      'Bit [2] tells you whether the faulting code was using MSP or PSP — without that, you read the wrong stack and dump garbage register values',
      'To get the stacked PC',
      'EXC_RETURN is meaningless in HardFault context',
    ],
    correct: 1,
    explanation:
      'EXC_RETURN bit [2]: 0 = MSP (handler/privileged), 1 = PSP (FreeRTOS task). Pick the right SP, then walk it to find xPSR/PC/LR/r12/r3-r0 of the faulting code. Guess wrong and your "PC" is a kernel address, not the buggy task.',
  },
  w3d4: {
    question: 'I2S at 16 kHz stereo, 32-bit per channel. What is BCLK?',
    options: [
      '16 kHz × 32 = 512 kHz',
      '16 kHz × 32 × 2 channels = 1.024 MHz',
      '16 kHz × 16 = 256 kHz',
      '38.4 MHz / 32 = 1.2 MHz',
    ],
    correct: 1,
    explanation:
      'BCLK clocks every bit of every channel: sample_rate × bits_per_sample × channels = 16,000 × 32 × 2 = 1.024 MHz. LRCLK = sample_rate = 16 kHz.',
  },
  w5d3: {
    question: 'Bootloader verifies firmware integrity. Why CRC32 instead of SHA-256?',
    options: [
      'CRC32 is more secure',
      'CRC32 catches transmission errors and is fast on Cortex-M without crypto hardware. SHA-256 is for *authenticity* against tampering — needs a signed hash, slower, more complex',
      'CRC32 is the only option Cortex-M supports',
      'They are interchangeable',
    ],
    correct: 1,
    explanation:
      'CRC32: integrity (did the flash get corrupted?). SHA-256 + signature: authenticity (is this firmware from a trusted source?). Use CRC32 alone if your threat model is bit-rot, not adversaries. Apple-grade boot uses both.',
  },
  w6d4: {
    question:
      'Single-bank OTA: download new image, erase old image, write new one. What is the failure mode?',
    options: [
      'Single-bank OTA cannot fail',
      'Power loss mid-write leaves device with neither old nor new firmware — bricked',
      'Single-bank is faster but uses more flash',
      'Single-bank requires a special bootloader',
    ],
    correct: 1,
    explanation:
      'Dual-bank: A keeps running while B is staged. Set boot pointer atomically. Power loss anytime → A still boots. Single-bank: window of vulnerability between erase and full write. Always pick dual-bank if flash budget allows.',
  },
};
