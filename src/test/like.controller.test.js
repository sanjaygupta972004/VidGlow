import {sum} from "../controllers/like.controller.js"

test("sum of 2 numbers",()=>{
     expect(sum(1,2)).toBe(3)
})

test("to check equality",()=>{
     const data = {
          name:"john",
          age:23
     }
     expect(data).toEqual({
          name:"john",
          age:23
     })
})

test("null is a falsy value",()=>{
     const nullValue = null
     expect(nullValue).toBeFalsy()
})

test("undefined is a falsy value",()=>{
     const undefinedValue = undefined
     expect(undefinedValue).toBeFalsy()
})

test("1 is a truthy value",()=>{
     const value = 1
     expect(value).toBeTruthy()
})

const divide = (a,b)=>{
     if(b===0){
          throw new Error("cannot divide by zero")
     }
     return a/b
}

test("divide 10 by 2",()=>{
     expect(divide(10,2)).toBe(5)
})