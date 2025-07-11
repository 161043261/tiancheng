# Go

## interface 的指针有类型信息

The structure behind Go interface has two: type and value.

::: code-group

```go [Demo 1]
package main

import (
	"fmt"
)

func main() {
	var s []int          // s == nil
	var m map[string]int // m == nil
	var p *int           // p == nil
	var c chan int       // c == nil

	var f func() // f == nil

	type T struct {
		p *int
	}
	var t T           // t.p == nil
	var a interface{} // a ==nil
	// var n = nil // compile error: use of untyped nil
	fmt.Println(s /* [] */, m /* map[] */, p /* nil */, c /* nil */, f /* nil */, t /* {nil} */, a /* nil */)
	fmt.Println(s == nil, m == nil, p == nil, c == nil, f == nil, t.p == nil, a == nil) // true true true true true true true
}
```

```go [Demo 2]
package main

import (
	"fmt"
	"reflect"
)

func main() {
	var p *int        // p { type: *int, value: nil }
	var a interface{} // a { type: interface{}, value: nil }

	if p != a {
		fmt.Println("1: not a nil") // 1: not a nil
	}

	a = p         // a { type: *int, value: nil }
	if a != nil { // nil { type: undefined, value: nil }
		fmt.Println("2: not a nil") // 2: not a nil
	}

	// 解决 1 与类型转换后的 nil 进行比较
	if a != (*int)(nil) {
		fmt.Println("3: not a nil") // 无输出
	}

	// 解决 2: 与手动创建的、指定类型的 nil 进行比较
	var p2 *int
	fmt.Println(a == p2) // true

	// 解决 2: 使用反射包
	if reflect.ValueOf(a).IsNil() {
		fmt.Println("4: Is nil") // 4: Is nil
	}
}
```

:::

### 案例

```go
package main

import (
	"fmt"
)

type myErr string

type myErr2 struct {
	lineNo string
	colNo  string
}

func (err myErr) Error() string {
	return string(err)
}

func (err myErr2) Error() string {
	return err.lineNo + err.colNo
}

func do() error {
	var err *myErr
	return err
}

func do2() *myErr {
	return nil
}

func wrapDo2() error {
	return do2()
}

func do3() error {
	var err *myErr2
	return err
}

func do4() *myErr2 {
	return nil
}

func wrapDo4() error {
	return do4()
}

// ! interface 的指针有类型信息
func main() {
	err := do()
	fmt.Println(err == nil)                         // false
	fmt.Println(err == nil || err == (*myErr)(nil)) // true

	err2 := do2()
	fmt.Println(err2 == nil) // true

	err3 := wrapDo2()
	fmt.Println(err3 == nil)                          // false
	fmt.Println(err3 == nil || err3 == (*myErr)(nil)) // true

	err4 := do3()
	fmt.Println(err4 == nil)                           // false
	fmt.Println(err4 == nil || err4 == (*myErr2)(nil)) // true

	err5 := do4()
	fmt.Println(err5 == nil) // true

	err6 := wrapDo4()
	fmt.Println(err6 == nil)                           // false
	fmt.Println(err6 == nil || err6 == (*myErr2)(nil)) // true
}
```
