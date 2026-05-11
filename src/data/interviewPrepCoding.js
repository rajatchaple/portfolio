// Daily coding challenges — Apple firmware interview targets.
// Based on Feb 2026 / Dec 2025 reports (Glassdoor + Blind): rounds are
// LeetCode-medium level, restricted to memory manipulation, bit ops,
// linked lists, and embedded protocol/driver code. No graph theory or DP.
//
// Each problem: statement → hints → solution → pitfalls → "appleNote".
// One problem surfaces per study day (sequentially by `day` field).

export const codingProblems = [
  {
    id: 'c01',
    day: 1,
    title: 'Set, clear, toggle bit N in a uint32_t',
    difficulty: 'easy',
    topic: 'Bit manipulation',
    problem:
      'Write three macros (or functions): SET_BIT(reg, n), CLEAR_BIT(reg, n), TOGGLE_BIT(reg, n). Each modifies `reg` in place. Then write IS_BIT_SET(reg, n) that returns 0 or 1.',
    hints: [
      'Use `1U << n` for the mask. Use unsigned to avoid signed-shift UB.',
      'Set with OR, clear with AND-NOT, toggle with XOR.',
      'IS_BIT_SET: shift the bit down to position 0 with `(reg >> n) & 1U`.',
    ],
    solution: `#define SET_BIT(reg, n)    ((reg) |=  (1U << (n)))
#define CLEAR_BIT(reg, n)  ((reg) &= ~(1U << (n)))
#define TOGGLE_BIT(reg, n) ((reg) ^=  (1U << (n)))
#define IS_BIT_SET(reg, n) (((reg) >> (n)) & 1U)

// As functions if you want type safety:
static inline void set_bit(volatile uint32_t *reg, uint8_t n) {
    *reg |= (1U << n);
}`,
    pitfalls: [
      'Forgetting the `U` suffix → signed shift, UB if n=31.',
      'Wrapping arg in parens — without it, `SET_BIT(x|y, 3)` becomes `x|y |= (1<<3)` which is wrong.',
      'Not using `volatile` when reg is a hardware register — compiler may optimize the write away.',
    ],
    appleNote:
      'Bit ops are THE staple firmware question. Expect this in the first 5 minutes of any coding screen.',
  },
  {
    id: 'c02',
    day: 2,
    title: 'Count set bits (population count)',
    difficulty: 'easy',
    topic: 'Bit manipulation',
    problem: 'Given uint32_t n, return how many bits are 1. e.g. popcount(0b1011) == 3.',
    hints: [
      'Naive: loop 32 times, check low bit, shift.',
      'Better: Brian Kernighan trick — `n & (n-1)` clears the lowest set bit. Loop until n == 0.',
      'Best: Cortex-M3/M4 hardware via `__builtin_popcount(n)` (compiles to a few instructions).',
    ],
    solution: `// Brian Kernighan — O(set bits), not O(32)
int popcount(uint32_t n) {
    int count = 0;
    while (n) {
        n &= (n - 1);  // clears lowest set bit
        count++;
    }
    return count;
}

// Parallel bit count (no loop, ~12 ops):
int popcount_parallel(uint32_t n) {
    n = n - ((n >> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >> 2) & 0x33333333);
    n = (n + (n >> 4)) & 0x0F0F0F0F;
    return (n * 0x01010101) >> 24;
}`,
    pitfalls: [
      'Naive loop with `if (n & 1) count++; n >>= 1;` is fine but O(32) regardless of input.',
      'Don\'t use `(n / 2)` — slower than `n >> 1` on hardware without barrel shifter (rare on M-series, common on M0).',
    ],
    appleNote:
      'Comes up in compression, parity, masking. Mention the K&R trick — interviewers like that.',
  },
  {
    id: 'c03',
    day: 3,
    title: 'Reverse bits in a uint32_t',
    difficulty: 'medium',
    topic: 'Bit manipulation',
    problem:
      'Return n with bit order reversed. bit 0 ↔ bit 31, bit 1 ↔ bit 30, etc. e.g. 0x80000001 → 0x80000001 (palindrome).',
    hints: [
      'Loop 32 times, building the output by shifting in n\'s low bit.',
      'Parallel swap: swap odd/even bits, then 2-bit pairs, then nibbles, then bytes.',
      'Cortex-M3+ has the RBIT instruction — single cycle.',
    ],
    solution: `uint32_t reverse_bits(uint32_t n) {
    uint32_t r = 0;
    for (int i = 0; i < 32; i++) {
        r = (r << 1) | (n & 1U);
        n >>= 1;
    }
    return r;
}

// Parallel swap — ~5 ops, no loop:
uint32_t reverse_bits_fast(uint32_t n) {
    n = ((n >> 1) & 0x55555555) | ((n & 0x55555555) << 1);
    n = ((n >> 2) & 0x33333333) | ((n & 0x33333333) << 2);
    n = ((n >> 4) & 0x0F0F0F0F) | ((n & 0x0F0F0F0F) << 4);
    n = ((n >> 8) & 0x00FF00FF) | ((n & 0x00FF00FF) << 8);
    n = (n >> 16) | (n << 16);
    return n;
}

// On Cortex-M3+:
// uint32_t r = __RBIT(n);  // one machine instruction`,
    pitfalls: [
      'Off-by-one: loop 32 times, not 31.',
      'Using signed int for `n` — right shift is implementation-defined for negative values.',
      'Forgetting the `U` suffix on the literal 1.',
    ],
    appleNote:
      'Drop the RBIT instruction reference — shows you know your Cortex-M ISA. Apple interviewers notice.',
  },
  {
    id: 'c04',
    day: 4,
    title: 'Check if power of 2',
    difficulty: 'easy',
    topic: 'Bit manipulation',
    problem: 'Return 1 if n is a power of 2 (1, 2, 4, 8, ...), else 0. n = 0 → 0.',
    hints: [
      'Powers of 2 have exactly one bit set.',
      '`n & (n - 1)` clears the lowest set bit. If n was a power of 2, result is 0.',
      'Watch the edge case: n == 0.',
    ],
    solution: `int is_power_of_two(uint32_t n) {
    return n != 0 && (n & (n - 1)) == 0;
}`,
    pitfalls: [
      'Forgetting n=0: `(0 & -1) == 0` → would incorrectly say "yes".',
      'Using signed int: `n - 1` on int_min wraps to int_max — works but is fragile.',
    ],
    appleNote:
      'Pairs with memory alignment questions. e.g., "How would you check if an address is aligned to N?"',
  },
  {
    id: 'c05',
    day: 5,
    title: 'Implement memcpy',
    difficulty: 'easy',
    topic: 'Memory',
    problem:
      'void *my_memcpy(void *dst, const void *src, size_t n); Behaves like libc memcpy. Behavior is undefined if regions overlap.',
    hints: [
      'Cast to char* for byte-by-byte copy. Loop n times.',
      'Optimization: copy word-at-a-time when both pointers are aligned and n >= sizeof(word).',
      'Return dst (matches libc signature).',
    ],
    solution: `void *my_memcpy(void *dst, const void *src, size_t n) {
    char *d = (char *)dst;
    const char *s = (const char *)src;
    while (n--) {
        *d++ = *s++;
    }
    return dst;
}

// Word-aligned fast path:
void *memcpy_fast(void *dst, const void *src, size_t n) {
    uintptr_t da = (uintptr_t)dst, sa = (uintptr_t)src;
    if (((da | sa) & 3) == 0) {
        uint32_t *d32 = (uint32_t *)dst;
        const uint32_t *s32 = (const uint32_t *)src;
        while (n >= 4) { *d32++ = *s32++; n -= 4; }
        dst = d32; src = s32;
    }
    char *d = (char *)dst;
    const char *s = (const char *)src;
    while (n--) *d++ = *s++;
    return dst;
}`,
    pitfalls: [
      'Not handling overlap: if src < dst < src+n, naive memcpy corrupts the source.',
      'Forgetting `const` on src.',
      'Returning void — should return dst per the standard.',
    ],
    appleNote:
      'Often followed up with: "Now make it work for overlapping regions (memmove)." See problem c06.',
  },
  {
    id: 'c06',
    day: 6,
    title: 'Implement memmove (handle overlap)',
    difficulty: 'medium',
    topic: 'Memory',
    problem:
      'void *my_memmove(void *dst, const void *src, size_t n); Like memcpy, but correctly handles overlapping regions.',
    hints: [
      'If dst < src: copy forward (low to high). If dst > src: copy backward (high to low).',
      'If they don\'t overlap, either direction works.',
      'Cast pointers to uintptr_t for the comparison if you want to be picky about pointer arithmetic.',
    ],
    solution: `void *my_memmove(void *dst, const void *src, size_t n) {
    char *d = (char *)dst;
    const char *s = (const char *)src;

    if (d < s) {
        // Forward copy is safe — dst is below src
        while (n--) *d++ = *s++;
    } else if (d > s) {
        // Copy backward — dst is above src and they may overlap
        d += n;
        s += n;
        while (n--) *--d = *--s;
    }
    // d == s: nothing to do
    return dst;
}`,
    pitfalls: [
      'Picking the wrong direction → corrupts the data.',
      'Off-by-one in backward loop — `*--d = *--s` is right; `*d-- = *s--` reads/writes one past the end first.',
      'Comparing pointers from different objects is technically UB. In practice on a flat address space it works.',
    ],
    appleNote:
      'The forward/backward decision is the gotcha. Walk the interviewer through why with a diagram.',
  },
  {
    id: 'c07',
    day: 7,
    title: 'Endian swap (16, 32, 64-bit)',
    difficulty: 'easy',
    topic: 'Memory',
    problem:
      'Write byte-swap functions for uint16_t, uint32_t, uint64_t. e.g. swap32(0xAABBCCDD) == 0xDDCCBBAA.',
    hints: [
      'Shift and mask to extract each byte, then OR them in the swapped order.',
      'On Cortex-M3+, `__builtin_bswap32` / __REV emits the REV instruction (1 cycle).',
    ],
    solution: `uint16_t swap16(uint16_t x) {
    return (x >> 8) | (x << 8);
}

uint32_t swap32(uint32_t x) {
    return ((x & 0xFF000000U) >> 24) |
           ((x & 0x00FF0000U) >>  8) |
           ((x & 0x0000FF00U) <<  8) |
           ((x & 0x000000FFU) << 24);
}

uint64_t swap64(uint64_t x) {
    return ((uint64_t)swap32(x) << 32) | swap32(x >> 32);
}

// Hardware-accelerated on Cortex-M3+:
// uint32_t r = __REV(x);     // CMSIS macro
// uint32_t r = __builtin_bswap32(x);`,
    pitfalls: [
      'Casting uint32_t to uint64_t too early — `(uint64_t)x >> 32` if x is uint32_t gives 0.',
      'Using signed int — right shift may sign-extend.',
    ],
    appleNote:
      'Network code, file formats, BLE attribute writes — all care about endianness. Mention __REV.',
  },
  {
    id: 'c08',
    day: 8,
    title: 'Aligned malloc',
    difficulty: 'hard',
    topic: 'Memory',
    problem:
      'Implement void *aligned_malloc(size_t size, size_t align) where align is a power of 2. Also write aligned_free(void *p). Use only standard malloc/free internally.',
    hints: [
      'Allocate size + align + sizeof(void*) bytes. Round up the returned pointer to the next aligned address.',
      'Store the original malloc-returned pointer just before the aligned pointer so free can recover it.',
      'Watch the math: `(p + align - 1) & ~(align - 1)` rounds up to alignment.',
    ],
    solution: `#include <stdint.h>
#include <stdlib.h>

void *aligned_malloc(size_t size, size_t align) {
    if ((align & (align - 1)) != 0) return NULL;  // must be power of 2
    void *raw = malloc(size + align + sizeof(void *));
    if (!raw) return NULL;
    uintptr_t addr = (uintptr_t)raw + sizeof(void *);
    addr = (addr + align - 1) & ~(uintptr_t)(align - 1);
    ((void **)addr)[-1] = raw;  // stash original pointer
    return (void *)addr;
}

void aligned_free(void *p) {
    if (!p) return;
    free(((void **)p)[-1]);
}`,
    pitfalls: [
      'Forgetting to store the original malloc pointer — can\'t free.',
      'Off-by-one in rounding: `(p + align)` vs `(p + align - 1)`. The minus-one is critical.',
      'Not validating align is a power of 2.',
      'Stashing the pointer at `(char*)addr - sizeof(void*)` requires that the alloc gave us enough headroom — that\'s why we add `align + sizeof(void*)`.',
    ],
    appleNote:
      'Memory-allocator question is a known Apple firmware screen. Expect 20+ minutes on this if asked.',
  },
  {
    id: 'c09',
    day: 9,
    title: 'Detect endianness at runtime',
    difficulty: 'easy',
    topic: 'Memory',
    problem: 'Return 1 if running on a little-endian machine, 0 if big-endian.',
    hints: [
      'Take a uint16_t with a known value and cast its address to uint8_t*. First byte tells you.',
      'A union also works.',
    ],
    solution: `int is_little_endian(void) {
    uint16_t x = 0x0001;
    return *(uint8_t *)&x == 0x01;
}

// Alternative with union — some say this is cleaner:
int is_little_endian_union(void) {
    union { uint16_t s; uint8_t b[2]; } u = { .s = 0x0001 };
    return u.b[0] == 0x01;
}`,
    pitfalls: [
      'Type-punning via cast is technically a strict-aliasing violation. The union version is portable.',
      'Cortex-M can be configured big-endian at reset (rare), so don\'t assume LE just because it\'s ARM.',
    ],
    appleNote:
      'Cortex-M is configurable but defaults to LE on every Apple chip. Mention the existence of BE-32 mode for credit.',
  },
  {
    id: 'c10',
    day: 10,
    title: 'Reverse a singly linked list',
    difficulty: 'easy',
    topic: 'Linked list',
    problem: 'Given the head of a singly linked list, reverse it in place. Return the new head.',
    hints: [
      'Three pointers: prev, curr, next. Walk forward, flipping each link.',
      'Recursive version is shorter but uses O(n) stack — avoid in firmware.',
    ],
    solution: `typedef struct Node {
    int val;
    struct Node *next;
} Node;

Node *reverse_list(Node *head) {
    Node *prev = NULL;
    Node *curr = head;
    while (curr) {
        Node *next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    pitfalls: [
      'Losing the next pointer — must save it before reassigning curr->next.',
      'Returning curr at end — wrong, curr is NULL. Return prev.',
      'Recursive version blows the stack for long lists in an embedded context.',
    ],
    appleNote:
      'Came up in multiple recent Apple firmware screens (Feb 2026 reports). Practice writing it cold in under 3 minutes.',
  },
  {
    id: 'c11',
    day: 11,
    title: 'Detect cycle in linked list (Floyd\'s)',
    difficulty: 'medium',
    topic: 'Linked list',
    problem: 'Return 1 if the linked list has a cycle, 0 otherwise. Constant extra space.',
    hints: [
      'Two pointers: slow moves 1 step, fast moves 2 steps.',
      'If fast catches slow → cycle. If fast reaches NULL → no cycle.',
      'If they meet, you can find the cycle start by resetting one to head and advancing both at 1 step.',
    ],
    solution: `int has_cycle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }
    return 0;
}

// Find the cycle start:
Node *cycle_start(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) break;
    }
    if (!fast || !fast->next) return NULL;
    slow = head;
    while (slow != fast) { slow = slow->next; fast = fast->next; }
    return slow;
}`,
    pitfalls: [
      'NULL check on `fast->next->next` — must check `fast && fast->next` first.',
      'Using a hash set — works but O(n) space; interviewer wants constant space.',
    ],
    appleNote:
      'Tortoise-and-hare is canonical. Be ready to explain why slow and fast meet (mod arithmetic on cycle length).',
  },
  {
    id: 'c12',
    day: 12,
    title: 'Find middle of linked list',
    difficulty: 'easy',
    topic: 'Linked list',
    problem:
      'Given head of a singly linked list, return the middle node. For even length, return the second middle.',
    hints: [
      'Slow + fast pointer. Fast moves 2x. When fast hits NULL, slow is at middle.',
      'For "first middle" of even-length list, stop when `fast->next` is NULL instead.',
    ],
    solution: `Node *middle(Node *head) {
    Node *slow = head, *fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;
}`,
    pitfalls: [
      'Empty list — handle head == NULL gracefully.',
      'Be specific about which middle for even lengths.',
    ],
    appleNote:
      'Trivial on its own but often a setup for follow-ups: split list in half, merge sorts, palindrome check.',
  },
  {
    id: 'c13',
    day: 13,
    title: 'Merge two sorted linked lists',
    difficulty: 'medium',
    topic: 'Linked list',
    problem:
      'Given heads of two sorted singly linked lists, return the head of the merged sorted list. No new allocations.',
    hints: [
      'Use a dummy head node so you don\'t special-case the first append.',
      'Walk both lists, append smaller node, advance.',
      'After loop, append whichever list still has nodes.',
    ],
    solution: `Node *merge(Node *a, Node *b) {
    Node dummy = {0, NULL};
    Node *tail = &dummy;
    while (a && b) {
        if (a->val <= b->val) {
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }
    tail->next = a ? a : b;
    return dummy.next;
}`,
    pitfalls: [
      'Forgetting to advance `tail`.',
      'Forgetting to attach the remaining list at the end.',
      'Allocating new nodes — the prompt usually requires in-place.',
    ],
    appleNote:
      'Building block for mergesort on linked lists. Often paired with the middle-finding problem.',
  },
  {
    id: 'c14',
    day: 14,
    title: 'Reverse a string in place',
    difficulty: 'easy',
    topic: 'Strings',
    problem:
      'void reverse(char *s); Reverses null-terminated string in place. Constant extra space.',
    hints: [
      'Find length with a strlen-style walk, or with two pointers from both ends.',
      'Swap first and last, second and second-to-last, etc.',
    ],
    solution: `void reverse(char *s) {
    if (!s) return;
    char *end = s;
    while (*end) end++;
    end--;
    while (s < end) {
        char tmp = *s;
        *s++ = *end;
        *end-- = tmp;
    }
}`,
    pitfalls: [
      'Off-by-one — end starts at the null terminator, must decrement before swapping.',
      'Empty string — make sure the algorithm doesn\'t deref past the start.',
      'Using a temp variable; XOR-swap is a cute trick but slower on real hardware.',
    ],
    appleNote:
      'Quoted directly in recent Apple firmware screens: "Sort characters in a string in place." This is the prerequisite.',
  },
  {
    id: 'c15',
    day: 15,
    title: 'Implement atoi',
    difficulty: 'medium',
    topic: 'Strings',
    problem:
      'int my_atoi(const char *s); Parse leading whitespace, optional sign, then digits. Stop on first non-digit. Saturate to INT_MIN/INT_MAX on overflow.',
    hints: [
      'Phases: skip whitespace → optional sign → consume digits → stop.',
      'Detect overflow BEFORE multiplying — check if (result > INT_MAX/10) or (result == INT_MAX/10 && digit > 7).',
      'Saturate, don\'t wrap.',
    ],
    solution: `#include <limits.h>
#include <ctype.h>

int my_atoi(const char *s) {
    if (!s) return 0;
    while (isspace((unsigned char)*s)) s++;
    int sign = 1;
    if (*s == '+' || *s == '-') {
        sign = (*s == '-') ? -1 : 1;
        s++;
    }
    int result = 0;
    while (*s >= '0' && *s <= '9') {
        int digit = *s - '0';
        // Overflow check (positive direction; negative handled at end)
        if (result > INT_MAX / 10 ||
            (result == INT_MAX / 10 && digit > INT_MAX % 10)) {
            return sign == 1 ? INT_MAX : INT_MIN;
        }
        result = result * 10 + digit;
        s++;
    }
    return sign * result;
}`,
    pitfalls: [
      'Overflow handling — the most common bug. Check before the multiply.',
      'INT_MIN is asymmetric: |INT_MIN| > INT_MAX. The above saturates to INT_MIN on negative overflow.',
      'Passing a signed char to isspace — UB if char is negative. Cast to unsigned char.',
    ],
    appleNote:
      'Common follow-up: "What does the C standard say about overflow?" Answer: signed integer overflow is UB; you handle it explicitly.',
  },
  {
    id: 'c16',
    day: 16,
    title: 'Circular (ring) buffer',
    difficulty: 'medium',
    topic: 'Embedded',
    problem:
      'Implement a fixed-size circular buffer of bytes with: cb_init, cb_push(byte), cb_pop(*byte), cb_full(), cb_empty(). Must be safe for one producer (ISR) and one consumer (task) without locks.',
    hints: [
      'Power-of-2 capacity simplifies the modulo (use mask, not %).',
      'Two indices: head (write) and tail (read). head == tail → empty. (head + 1) & mask == tail → full.',
      'For lock-free SPSC, mark head/tail as volatile — but really you want C11 atomics or memory barriers on multi-core.',
    ],
    solution: `#define CB_CAP 64  // must be power of 2
#define CB_MASK (CB_CAP - 1)

typedef struct {
    uint8_t buf[CB_CAP];
    volatile uint32_t head;  // written by producer
    volatile uint32_t tail;  // written by consumer
} cb_t;

void cb_init(cb_t *cb) { cb->head = cb->tail = 0; }
int cb_empty(cb_t *cb) { return cb->head == cb->tail; }
int cb_full(cb_t *cb)  { return ((cb->head + 1) & CB_MASK) == (cb->tail & CB_MASK); }

int cb_push(cb_t *cb, uint8_t b) {
    uint32_t next = (cb->head + 1) & CB_MASK;
    if (next == (cb->tail & CB_MASK)) return -1;  // full
    cb->buf[cb->head & CB_MASK] = b;
    cb->head = next;
    return 0;
}

int cb_pop(cb_t *cb, uint8_t *b) {
    if (cb->head == cb->tail) return -1;  // empty
    *b = cb->buf[cb->tail & CB_MASK];
    cb->tail = (cb->tail + 1) & CB_MASK;
    return 0;
}`,
    pitfalls: [
      'Using `%` instead of mask — slower without a divider, and only works when CAP is power of 2 anyway.',
      'Forgetting `volatile` — compiler can hoist reads out of the polling loop and you spin forever.',
      'On multi-core (Apple silicon), you need C11 atomics or DMB barriers, not just volatile. Single-core M4F: volatile is sufficient.',
    ],
    appleNote:
      'UART RX, audio I2S, BLE attribute writes — circular buffers are everywhere. Must be ISR-safe.',
  },
  {
    id: 'c17',
    day: 17,
    title: 'Bit-field struct: parse a packet header',
    difficulty: 'medium',
    topic: 'Embedded',
    problem:
      'You receive a 4-byte BLE attribute write packet: bits [0..6] = opcode, bit [7] = ack_req, bits [8..23] = handle, bits [24..31] = length. Parse it from a uint32_t (received in little-endian).',
    hints: [
      'Bitfields in a struct are NOT portable — bit ordering is implementation-defined.',
      'For wire protocols, always parse with explicit shift+mask. Use bitfields only for register access on a known compiler.',
    ],
    solution: `typedef struct {
    uint8_t opcode;
    uint8_t ack_req;
    uint16_t handle;
    uint8_t length;
} att_packet_t;

void parse_packet(uint32_t raw, att_packet_t *pkt) {
    pkt->opcode  = (raw >>  0) & 0x7F;
    pkt->ack_req = (raw >>  7) & 0x01;
    pkt->handle  = (raw >>  8) & 0xFFFF;
    pkt->length  = (raw >> 24) & 0xFF;
}

// For comparison — bitfields are NOT portable:
typedef struct {
    uint32_t opcode  : 7;
    uint32_t ack_req : 1;
    uint32_t handle  : 16;
    uint32_t length  : 8;
} att_bitfield_t;
// Bit order, padding, and storage order are all implementation-defined.`,
    pitfalls: [
      'Using bitfields for wire protocols → breaks across compilers / endianness.',
      'Forgetting to mask after shift — if the field is 7 bits, the high bit of the next field bleeds in without `& 0x7F`.',
      'Assuming network byte order vs native — clarify with the interviewer.',
    ],
    appleNote:
      'Apple firmware deals with BLE, MFi, USB, audio packets — wire parsing is daily work. Always use shift+mask.',
  },
  {
    id: 'c18',
    day: 18,
    title: 'CRC32 — bit-by-bit, no lookup table',
    difficulty: 'medium',
    topic: 'Embedded',
    problem:
      'Implement CRC-32 (poly 0xEDB88320, reflected, init 0xFFFFFFFF, final XOR with 0xFFFFFFFF) over a byte buffer. No lookup table.',
    hints: [
      'For each byte: XOR into the low byte of CRC, then shift right 8 times, conditionally XORing the poly.',
      'Bit-reversed polynomial 0xEDB88320 = bit-reversed 0x04C11DB7.',
      'Init and final XOR is the IEEE 802.3 standard.',
    ],
    solution: `uint32_t crc32(const uint8_t *data, size_t len) {
    uint32_t crc = 0xFFFFFFFFU;
    for (size_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (int b = 0; b < 8; b++) {
            uint32_t mask = -(int32_t)(crc & 1U);
            crc = (crc >> 1) ^ (0xEDB88320U & mask);
        }
    }
    return ~crc;
}`,
    pitfalls: [
      'Wrong polynomial direction. LSB-first uses 0xEDB88320; MSB-first uses 0x04C11DB7. They\'re not interchangeable.',
      'Forgetting init = all-1s and final XOR.',
      'Branchy version (`if (crc & 1)`) works but is slower than the mask trick.',
    ],
    appleNote:
      'OTA bootloader, flash integrity, BLE link layer — all use CRC. Must know cold (and what the table version optimizes).',
  },
  {
    id: 'c19',
    day: 19,
    title: 'Bit-bang I2C — start condition',
    difficulty: 'medium',
    topic: 'Embedded',
    problem:
      'Write a function `i2c_start(void)` that toggles SDA and SCL GPIO pins to generate an I2C START condition. Assume `set_sda(int)`, `set_scl(int)`, and `delay_us(int)` are provided.',
    hints: [
      'START = SDA high → SDA low while SCL is high.',
      'Before that, both lines must be high (bus idle).',
      'Quarter-bit delays — for 100 kHz I2C, each step is ~2.5 µs.',
    ],
    solution: `extern void set_sda(int level);
extern void set_scl(int level);
extern void delay_us(int us);

#define I2C_QUARTER_US 3  // for ~100 kHz

void i2c_start(void) {
    // Idle: both high
    set_sda(1);
    set_scl(1);
    delay_us(I2C_QUARTER_US);

    // START: SDA falls while SCL is high
    set_sda(0);
    delay_us(I2C_QUARTER_US);
    set_scl(0);
    delay_us(I2C_QUARTER_US);
}

void i2c_stop(void) {
    // SDA low first, then SCL high, then SDA rises while SCL high
    set_sda(0);
    set_scl(1);
    delay_us(I2C_QUARTER_US);
    set_sda(1);
    delay_us(I2C_QUARTER_US);
}`,
    pitfalls: [
      'Forgetting the bus must be idle (both high) before START.',
      'Generating SDA fall after SCL is already low — that\'s not a START, it\'s just a bit change.',
      'Not configuring pins as open-drain — direct push-pull will fight the pull-up and possibly damage the bus.',
    ],
    appleNote:
      'A "write a driver" question is on the published Apple firmware question list. I2C bit-banging is a common variant.',
  },
  {
    id: 'c20',
    day: 20,
    title: 'Producer/consumer with FreeRTOS queue',
    difficulty: 'medium',
    topic: 'Concurrency',
    problem:
      'One ISR captures audio samples and posts to a queue. One task drains the queue and processes them. Write both, using the correct FreeRTOS API for each context.',
    hints: [
      'Use `xQueueSendFromISR` in the ISR, `xQueueReceive` in the task.',
      'The ISR variant takes a `pxHigherPriorityTaskWoken` so you can yield.',
      'Call `portYIELD_FROM_ISR(woken)` at the end of the ISR to context-switch immediately if needed.',
    ],
    solution: `#include "FreeRTOS.h"
#include "queue.h"
#include "task.h"

static QueueHandle_t audio_q;

void audio_init(void) {
    audio_q = xQueueCreate(8, sizeof(int16_t));
    configASSERT(audio_q != NULL);
}

// In ISR — fast, non-blocking
void DMA_AudioComplete_Handler(int16_t sample) {
    BaseType_t woken = pdFALSE;
    xQueueSendFromISR(audio_q, &sample, &woken);
    portYIELD_FROM_ISR(woken);
}

// In task — blocks waiting for data
void audio_task(void *arg) {
    (void)arg;
    int16_t sample;
    for (;;) {
        if (xQueueReceive(audio_q, &sample, portMAX_DELAY) == pdTRUE) {
            // Process sample (filter, DSP, etc.)
        }
    }
}`,
    pitfalls: [
      'Calling `xQueueSend` (the non-ISR variant) from an ISR → undefined behavior, often a crash.',
      'Forgetting `portYIELD_FROM_ISR` — works but the task waits until the next tick instead of running immediately.',
      'Setting queue depth too small → ISR fills it, drops samples on overflow.',
    ],
    appleNote:
      'Two-context coding (ISR + task) is a classic Apple firmware screen. They want to see you know FromISR APIs cold.',
  },
  {
    id: 'c21',
    day: 21,
    title: 'Test-and-set mutex (manual atomic)',
    difficulty: 'hard',
    topic: 'Concurrency',
    problem:
      'Implement `mutex_lock(volatile int *m)` and `mutex_unlock(volatile int *m)` using LDREX/STREX (or __atomic builtins). Block on lock until free.',
    hints: [
      'LDREX loads with monitor; STREX writes back conditionally and returns 0 on success, 1 on failure (another store happened).',
      'Spin: LDREX → if locked, retry. Else STREX 1, if success done; if fail, retry.',
      'On Apple Silicon (multi-core), you also need a DMB before/after to ensure memory ordering.',
    ],
    solution: `// GCC builtins (portable across Cortex-M):
void mutex_lock(volatile int *m) {
    while (__atomic_test_and_set(m, __ATOMIC_ACQUIRE)) {
        // Spin. On real systems, add __WFE or yield.
    }
}

void mutex_unlock(volatile int *m) {
    __atomic_clear(m, __ATOMIC_RELEASE);
}

// Manual LDREX/STREX on Cortex-M3+:
void mutex_lock_manual(volatile int *m) {
    int locked;
    do {
        while (__LDREXW((uint32_t *)m) != 0);
        locked = __STREXW(1, (uint32_t *)m);
    } while (locked);
    __DMB();  // memory barrier
}

void mutex_unlock_manual(volatile int *m) {
    __DMB();
    *m = 0;
}`,
    pitfalls: [
      'Missing memory barriers — without DMB, loads/stores can reorder around the lock on multi-core.',
      'Cortex-M0 has no LDREX/STREX — must disable interrupts instead.',
      'Spinning forever without WFE wastes power. Real production code yields or sleeps.',
    ],
    appleNote:
      'Apple Silicon (multi-core) demands memory ordering knowledge. Even on single-core M4F, mention DMB to show awareness.',
  },
  {
    id: 'c22',
    day: 22,
    title: 'Remove Nth node from end',
    difficulty: 'medium',
    topic: 'Linked list',
    problem:
      'Given head of linked list and integer n, remove the nth node from the end and return the head.',
    hints: [
      'Two-pointer trick: advance fast by n. Then move slow and fast together until fast hits NULL. Slow is at the node before the one to remove.',
      'Use a dummy node to handle the case "remove the head" uniformly.',
    ],
    solution: `Node *remove_nth_from_end(Node *head, int n) {
    Node dummy = {0, head};
    Node *slow = &dummy, *fast = &dummy;
    for (int i = 0; i <= n; i++) {
        if (!fast) return head;  // n too large
        fast = fast->next;
    }
    while (fast) {
        slow = slow->next;
        fast = fast->next;
    }
    Node *to_delete = slow->next;
    slow->next = to_delete->next;
    free(to_delete);  // if dynamically allocated
    return dummy.next;
}`,
    pitfalls: [
      'Off-by-one on the gap between slow and fast.',
      'Edge case: removing the head node. The dummy handles this cleanly.',
      'Not freeing memory if heap-allocated — leaks in long-running firmware.',
    ],
    appleNote:
      'Linked-list problems dominate Apple firmware screens (search results confirm: \'restricted to trees and linked lists\').',
  },
  {
    id: 'c23',
    day: 23,
    title: 'Sign-extend an N-bit signed value',
    difficulty: 'medium',
    topic: 'Bit manipulation',
    problem:
      'An ADC returns 18-bit signed values packed in a uint32_t. Convert to int32_t with sign preserved. e.g. 0x3FFFF (max 18-bit positive) → 131071; 0x20000 (18-bit -131072) → -131072.',
    hints: [
      'Shift left by (32 - N) to push the sign bit to bit 31, then arithmetic right shift back.',
      'Cast to signed before right-shift — unsigned shift fills with 0.',
    ],
    solution: `int32_t sign_extend(uint32_t value, int n_bits) {
    // Push sign bit to bit 31, then arithmetic shift right
    int shift = 32 - n_bits;
    return ((int32_t)(value << shift)) >> shift;
}

// Usage: parse SPH0645 mic sample (18-bit in bits [31:14] of a 32-bit I2S word)
int32_t parse_sph0645(uint32_t raw) {
    int32_t s24 = raw >> 14;       // align to bottom
    return sign_extend(s24, 18);   // sign-extend
}`,
    pitfalls: [
      'C does not guarantee arithmetic right shift on signed values — it\'s implementation-defined. GCC/Clang on ARM use arithmetic. For portability, use `value | (value & (1 << (n-1))) ? ~((1<<n) - 1) : 0`.',
      'Forgetting to cast before shifting — `value >> shift` on uint32_t fills with 0.',
    ],
    appleNote:
      'Audio (I2S) and ADC reads always involve sign-extending odd bit-widths. AirPods mic firmware does this constantly.',
  },
  {
    id: 'c24',
    day: 24,
    title: 'Validate BST',
    difficulty: 'medium',
    topic: 'Trees',
    problem:
      'Given the root of a binary tree, return 1 if it\'s a valid Binary Search Tree (left < node < right for every node, recursively).',
    hints: [
      'Naive: check left.val < node.val < right.val. WRONG — this misses cases where a deeper node violates.',
      'Correct: pass down bounds. Each node must be within (lo, hi). Recurse with updated bounds.',
      'Or: in-order traversal must be strictly increasing.',
    ],
    solution: `#include <limits.h>

typedef struct Tree {
    int val;
    struct Tree *left, *right;
} Tree;

int validate_bounds(Tree *node, long lo, long hi) {
    if (!node) return 1;
    if (node->val <= lo || node->val >= hi) return 0;
    return validate_bounds(node->left, lo, node->val) &&
           validate_bounds(node->right, node->val, hi);
}

int is_valid_bst(Tree *root) {
    return validate_bounds(root, LONG_MIN, LONG_MAX);
}`,
    pitfalls: [
      'Comparing only with immediate children — passes locally invalid but globally invalid trees.',
      'Using INT_MIN/INT_MAX as bounds — fails when a node has val == INT_MIN or INT_MAX. Use long.',
      'Off-by-one on strict-vs-equal — duplicates: depends on the BST definition.',
    ],
    appleNote:
      'Tree problems appear in Apple firmware screens but less often than linked lists. Know the bounds trick.',
  },
  {
    id: 'c25',
    day: 25,
    title: 'Find substring (strstr)',
    difficulty: 'medium',
    topic: 'Strings',
    problem:
      'const char *my_strstr(const char *hay, const char *needle); Returns pointer to first occurrence of needle in hay, or NULL. Empty needle returns hay.',
    hints: [
      'Naive O(n*m): for each position in hay, compare needle bytes.',
      'Optimized: KMP / Boyer-Moore. Probably overkill for an interview; explain you know they exist.',
    ],
    solution: `const char *my_strstr(const char *hay, const char *needle) {
    if (!*needle) return hay;
    for (; *hay; hay++) {
        const char *h = hay, *n = needle;
        while (*h && *n && *h == *n) { h++; n++; }
        if (!*n) return hay;
    }
    return NULL;
}`,
    pitfalls: [
      'Forgetting the empty-needle edge case.',
      'Not handling the case where needle is longer than the remaining hay — handled implicitly because *h becomes 0 first.',
      'Overreading hay — the *h check inside the inner loop guards against this.',
    ],
    appleNote:
      'Common warmup question. If the interviewer wants O(n+m), mention KMP — implementing it cold is unrealistic.',
  },
];

// Helper — get coding problem for a given study day index (1-based)
export const codingForDay = dayIndex => codingProblems.find(c => c.day === dayIndex) || null;

// Helper — list all coding problems
export const allCodingProblems = () => codingProblems;
