const HTMLParser = require('./htmlparser')

HTMLParser(`
	<div id="id1" class="class1">
		<!-- comment text -->
		<div>
			<span>layer 2</span>
		</div>
		<span>layer 1</span>
	</div>`, {
	start: function(tag, attrs, unary) {
		console.log('start', tag, attrs, unary)
	},
	end: function(tag) {
		console.log('end', tag)
	},
    chars: function(text) {
    	console.log('chars', text.replace('\n', '\\n'))
    },
    comment: function(text) {
    	console.log('comment', text)
    }
})

/* Output

chars \n
start div [ { name: 'id', value: 'id1', escaped: 'id1' },
  { name: 'class', value: 'class1', escaped: 'class1' } ] false
chars \n
comment  comment text
chars \n
start div [] false
chars \n
start span [] false
chars layer 2
end span
chars \n
end div
chars \n
start span [] false
chars layer 1
end span
chars \n
end div

*/


// 在htmlparse的基础上可以构造AST
function HTMLtoAST(html){
    var root = null
    var stack = []
    HTMLParser(html,{
        start(tag,attrs,unary){
            var element = { tag, attrs, children:[], type:1 }
            if(!root){
                root = element
            }
            if(stack.length){
                var currentParent = stack[stack.length-1]
                currentParent.children.push(element)
                element.parent = currentParent
            }
            if(!unary){
                stack.push(element)
            }
        },
        end(){
            stack.pop()
        },
        chars(text){
              var currentParent = stack[stack.length - 1]
              currentParent.children.push({ type: 2, text })
        }
    })
    return root
}

const result = HTMLtoAST(`<div id="id1" class="class1">
		<!-- comment text -->
		<div>
			<span>layer 2</span>
		</div>
		<span>layer 1</span>
	</div>`)

console.log('\nResult\n\n', result, '\n\nDeeper child\n\n', result.children[2].children[1])

/* Output

Result

 { tag: 'div',
  attrs:
   [ { name: 'id', value: 'id1', escaped: 'id1' },
     { name: 'class', value: 'class1', escaped: 'class1' } ],
  children:
   [ { type: 2, text: '\n\t\t' },
     { type: 2, text: '\n\t\t' },
     { tag: 'div',
       attrs: [],
       children: [Array],
       type: 1,
       parent: [Circular] },
     { type: 2, text: '\n\t\t' },
     { tag: 'span',
       attrs: [],
       children: [Array],
       type: 1,
       parent: [Circular] },
     { type: 2, text: '\n\t' } ],
  type: 1 }

Deeper child

 { tag: 'span',
  attrs: [],
  children: [ { type: 2, text: 'layer 2' } ],
  type: 1,
  parent:
   { tag: 'div',
     attrs: [],
     children: [ [Object], [Circular], [Object] ],
     type: 1,
     parent: { tag: 'div', attrs: [Array], children: [Array], type: 1 } } }

*/