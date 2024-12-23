---
layout: post
title:  "Why Passing Pointers to Interfaces in Go Matters (And How It Affects GORM)"
author: kevin
categories: [ Go, Troubleshooting ]
image: assets/images/2024-12-23-passing-pointers-to-interfaces.png
---
I came across this error message a few days ago when working with GORM:

```
panic: reflect: reflect.Value.SetString using unaddressable value
```

Encountering this error led me to dive deeper into how Go interfaces and pointers interact. Here's to share what I learned and why this error occurs, why passing pointers to interfaces is crucial, and how to resolve such issues.

---

### The Problem
Here’s the initial code that caused the issue:

```go
package main

import (
	"fmt"
	"gorm.io/gorm"
)

type animal interface {
	Type() string
	SomeFunction()
}

type dog struct {
	Name    string `gorm:"column:name"`
	Column1 string `gorm:"column:column1"`
	Column2 string `gorm:"column:column2"`
}

func (d dog) Type() string {
	return "dog"
}

func (d dog) SomeFunction() {
	// do something
	return
}

var db *gorm.DB // Assume this is initialized elsewhere

func main() {
	d := dog{}
	err := run(d)
	if err != nil {
		fmt.Println("Error:", err)
	}
}

func run(a animal) error {
	// Passing the pointer of the interface
	if err := db.Raw("SELECT * FROM animals WHERE type = ?", a.Type()).Scan(&a).Error; err != nil {
		return err
	}
	return nil
}
```

At first glance, you might think this should work. After all, we’re passing `&a` to `Scan`, and `a` satisfies the `animal` interface. However, this code results in a runtime panic. Why?

---

### Why Passing `&a` Doesn’t Work

The root of the problem lies in **how Go interfaces work**. Let’s break it down step by step:

#### 1. **Interfaces Hold Values or Pointers, Not Both**
When `a` (of type `animal`) is passed to the `run` function, it holds a **copy** of the `dog` struct. If you attempt to pass `&a` to GORM, you’re effectively passing the **address of the interface itself**, not the underlying value (or pointer) inside it.

#### 2. **Reflection Needs Addressable Values**
GORM’s `Scan` function uses reflection to populate fields. Reflection requires an addressable value (i.e., a pointer to a struct) to modify its fields. In this case:

- The interface `a` is not addressable.
- Even though you pass `&a` to `Scan`, GORM can’t access or modify the underlying value (`dog`) inside the interface.

This is why you see the error `reflect.Value.SetString using unaddressable value`.

#### 3. **The Key Insight**
The interface `a` is like a box that holds either a value or a pointer. Passing `&a` to `Scan` simply gives GORM the address of the box, but GORM doesn’t know how to unpack the box to access the actual `dog` value inside.

---

### Fixing the Code

To solve this, you need to ensure that GORM receives a pointer to the actual struct (`dog`) instead of the interface. This means changing how the `run` function is called and ensuring the interface holds a pointer to the struct from the beginning.

Here’s the corrected code:

```go
func main() {
	d := dog{}
	err := run(&d) // Pass a pointer to the dog struct
	if err != nil {
		fmt.Println("Error:", err)
	}
}

func run(a animal) error {
	// No need to take the pointer of `a` now; it's already a pointer to `dog`
	if err := db.Raw("SELECT * FROM animals WHERE type = ?", a.Type()).Scan(a).Error; err != nil {
		return err
	}
	return nil
}
```

#### Key Changes:
1. In `main`, pass `&d` (a pointer to `dog`) when calling `run`.
2. In `run`, pass `a` directly to `Scan` without taking its address.

Now, GORM receives the correct type: a pointer to the underlying struct (`dog`), which is addressable and can be modified by reflection.

---

### Understanding the Fix

#### Why Does This Work?
When you pass `&d` to the `run` function:
- The interface `a` holds a **pointer** to the `dog` struct (`*dog`).
- GORM’s `Scan` function can now follow the pointer and populate the fields of the actual `dog` struct.

#### Why Didn’t Passing `dog{}` Work?
When you pass `dog{}` (a value) to `run`, the interface holds a **copy** of the value, not the original struct. This makes it impossible for GORM to modify the fields because the copy is not addressable.

---

### Key Takeaways

1. **Go Interfaces Hold Copies**:
   - When you pass a value (e.g., `dog{}`) to an interface, the interface holds a copy of the value.
   - To allow modification, the interface must hold a pointer to the original value.

2. **Reflection Requires Addressability**:
   - GORM’s `Scan` function uses reflection to populate struct fields. For this to work, the input must be addressable (i.e., a pointer to a struct).

3. **Pass Pointers from the Start**:
   - Always pass pointers when working with GORM to ensure fields can be populated correctly.

4. **Don’t Pass Interface Pointers to GORM**:
   - Passing `&a` (the pointer to the interface) doesn’t solve the problem because GORM cannot access the value inside the interface.

---

### Final Thoughts

This issue highlights the importance of understanding how Go interfaces and pointers work under the hood. By ensuring that interfaces hold pointers to structs, I believe you can avoid common pitfalls when working with libraries like GORM. With this understanding, I was able to write more robust and reliable Go code. :\)

