---
title: Cortex-M bootloader → application jump
description: The exact sequence for handing control from a bootloader to the app, and the bugs that bite if you skip a step.
date: '2026-11-15'
tags:
  - Bootloader
  - ARM Cortex-M
---

## The short version

1. The app's vector table starts at `APP_ADDR`: word 0 is the **initial stack pointer**, word 1 is the **reset handler**.
2. Leave the hardware as close to reset state as you can: interrupts off, SysTick off, pending IRQs cleared.
3. Point `SCB->VTOR` at the app, load MSP, then branch to the reset handler.
4. The app re-enables interrupts itself.

## Jump sequence

```c
/* Must be aligned for VTOR: 128 bytes minimum, more with many IRQs */
#define APP_ADDR 0x08008000UL

typedef void (*entry_t)(void);

void jump_to_app(void)
{
    uint32_t sp    = *(volatile uint32_t *)(APP_ADDR + 0);
    uint32_t reset = *(volatile uint32_t *)(APP_ADDR + 4);

    /* SP must point into RAM, or there is no valid app (adjust to your RAM map) */
    if ((sp & 0x2FF00000UL) != 0x20000000UL) {
        return;
    }

    __disable_irq();

    SysTick->CTRL = 0;
    SysTick->LOAD = 0;
    SysTick->VAL  = 0;

    for (uint32_t i = 0; i < 8; i++) {
        NVIC->ICER[i] = 0xFFFFFFFFUL; /* disable */
        NVIC->ICPR[i] = 0xFFFFFFFFUL; /* clear pending */
    }

    /* De-init peripherals + clocks the bootloader started (HAL_DeInit, RCC reset) */

    SCB->VTOR = APP_ADDR;
    __DSB();
    __ISB();

    __set_MSP(sp);
    ((entry_t)reset)();
}
```

## Application side

- Linker script: `FLASH ORIGIN = 0x08008000` (same as `APP_ADDR`).
- If the startup code doesn't set `VTOR`, set it first thing in `SystemInit()`.
- Call `__enable_irq()` once the app's own init is done, since the bootloader left PRIMASK set.

## Gotchas

| Symptom                                         | Likely cause                                                  |
| ----------------------------------------------- | ------------------------------------------------------------- |
| HardFault right after the jump                  | Wrong `APP_ADDR`, or the app is linked at a different address |
| App's first interrupt jumps into the bootloader | `VTOR` not updated                                            |
| Random IRQ fires as the app starts              | Pending bit left from the bootloader; clear `ICPR`            |
| SysTick ticks before the app's HAL is ready     | SysTick not disabled before the jump                          |
| Works from debugger, not from power-on          | Debugger reset the peripherals for you; de-init them properly |

> Prefer jumping from a **clean reset**: set a flag in no-init RAM, `NVIC_SystemReset()`, and branch early in the bootloader before it starts any peripherals. It's the most reliable way to hand over pristine hardware.
