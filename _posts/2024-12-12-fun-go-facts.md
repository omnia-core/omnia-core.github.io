---
layout: post
title:  "Fun and Surprising Go Facts You Probably Didn’t Know!"
author: kevin
categories: [ Go, Fun Facts ]
image: assets/images/gopher.png
---
Here are some **lesser-known Go (Golang) facts** that even go developers might not know:

---

## **1. Go’s `nil` Has Its Own Quirks**
In Go, the `nil` value behaves unexpectedly when applied to **interfaces**. An interface can be `nil`, but its underlying type and value also determine how `nil` behaves.

Example:
```go
var i interface{} = (*int)(nil)

if i == nil {
    fmt.Println("i is nil")
} else {
    fmt.Println("i is NOT nil")
}
```

**Output**:
```
i is NOT nil
```

Why? Because while the underlying value is `nil`, the interface itself still holds a *type* (`*int`) and isn’t considered completely nil.

---

## **2. Go’s `defer` Uses LIFO (Last-In, First-Out)**
When multiple `defer` statements are used, they are executed in reverse order — like a stack.

Example:
```go
func main() {
    defer fmt.Println("1")
    defer fmt.Println("2")
    defer fmt.Println("3")
}
```

**Output**:
```
3
2
1
```

This LIFO execution order is intentional and can be used strategically, such as ensuring resources are released in the opposite order they were acquired.

---

## **3. Go Has a Built-in Memory Alignment Trick**
Go automatically aligns fields in a struct to optimize memory usage, but **the order of fields matters**.

Example:
```go
type Example struct {
    A byte
    B int64
    C byte
}
```

Here, Go will add **padding** between fields to maintain memory alignment, resulting in more memory consumption than expected. Rearranging the fields can fix this:

```go
type ExampleOptimized struct {
    B int64
    A byte
    C byte
}

func main() {
    fmt.Printf("Size of Misaligned struct: %d bytes\n", unsafe.Sizeof(Misaligned{}))
    fmt.Printf("Size of Aligned struct: %d bytes\n", unsafe.Sizeof(Aligned{}))

    fmt.Printf("\nField offsets in Misaligned struct:\n")
    fmt.Printf("A: %d\n", unsafe.Offsetof(Misaligned{}.A))
    fmt.Printf("B: %d\n", unsafe.Offsetof(Misaligned{}.B))
    fmt.Printf("C: %d\n", unsafe.Offsetof(Misaligned{}.C))

    fmt.Printf("\nField offsets in Aligned struct:\n")
    fmt.Printf("B: %d\n", unsafe.Offsetof(Aligned{}.B))
    fmt.Printf("A: %d\n", unsafe.Offsetof(Aligned{}.A))
    fmt.Printf("C: %d\n", unsafe.Offsetof(Aligned{}.C))
}
```

**Output**:
```
Size of Example struct: 24 bytes
Size of ExampleOptimized struct: 16 bytes

Field offsets in Example struct:
A: 0
B: 8
C: 16

Field offsets in ExampleOptimized struct:
B: 0
A: 8
C: 9
```

By grouping fields of similar size together, you can reduce memory usage significantly.

---

## **4. Go’s Empty Slice Isn’t Always `nil`**
An uninitialized slice is `nil`, but a slice created with `make()` or an empty literal is **not `nil`**, even if it has no elements.

Example:
```go
var s1 []int
s2 := make([]int, 0)
s3 := []int{}

fmt.Println(s1 == nil) // true
fmt.Println(s2 == nil) // false
fmt.Println(s3 == nil) // false
```

Understanding this distinction is critical when writing code that checks for "empty slices."

---

## **5. Go’s Complex `select` Behavior in Deadlocks**
Go’s `select` statement, while powerful, has edge cases that can lead to unexpected behavior, especially with deadlocks. If all channels in a `select` block are blocked and there is no `default` case, the program **deadlocks**, but Go’s runtime handles this differently depending on the context.

Example:
```go
package main

import (
    "fmt"
    "time"
)

func main() {
    ch1 := make(chan int)
    ch2 := make(chan int)

    go func() {
        time.Sleep(1 * time.Second)
        ch1 <- 42
    }()

    select {
    case val := <-ch1:
        fmt.Println("Received from ch1:", val)
    case val := <-ch2:
        fmt.Println("Received from ch2:", val)
    }
}
```

**Behavior:** If neither channel is ready and there’s no `default` case, the `select` blocks indefinitely. However, Go’s runtime avoids spinning CPU cycles inefficiently and places the goroutine into a sleep state until one of the channels becomes available. This behavior is subtle and can lead to tricky bugs when reasoning about concurrency.

---