# schema-shorthand

This is a quick experiment with writing schema in js, influenced
by js-schema.

I'm unhappy with all the schema tools that I know of. There are two simple
features I require.

- Schemas should be easy for humans to write.
- Schemas should be easy for humans to read.

In particular, they should look like the data they represent.

Low-level schema documents in json, xml, etc., are great for machines, but
horrible for authoring: they're verbose and inscrutable. Web forms and other
GUI tools can't provide sufficient flexibilty or automation. Maintaining a
schema that was created with a GUI is exceedingly painful. A simple DSL or API
that looks similar to the data is much better.

Similarly, generated schema documentation typically looks like a low-level
schema document, rather than the data it represents. Often it's rendered as a
table, which inhibits easy understanding of the shape of the data.

Finally, many schema tools are deeply integrated in preprocessors or build
systems, which limits their utility.

schema-shorthand attempts to address these issues by

- describing schemas primarily in terms of object literals in the shape of the data they represent,
- rendering schemas in the shape of the data they represent,
- representing schemas with simple data structures (variants) that can be easily used by other tools.

# Schema API

```javascript
var S = require('schema-shorthand');
var {d, r, string, array, number, or, nullval, boolean, object, dict} = S;

// A circle
var circle = d('circle', 'A circle, with color',
	S({
		x: number(),                         // any number
		y: number(),
		r: number([0]),                      // any non-negative number
		color: or('red', 'orange', 'yellow') // One of the three color strings
	})
);

// The same circle, as a tuple.
var circleV = d('circle', 'A circle, with color',
	S([
		r('x', number()),
		r('y', number()),
		r('r', number([0])),
		r('color', or('red', 'orange', 'yellow'))
	])
);
```
The ```S``` function is a convenience method that guesses the proper schema method based
on the type of its arguments. It invokes the underlying type methods (```string```, ```object```, etc.)
as needed. If a construct would be misinterpreted by ```S```, you must use the appropriate type
method instead.

```javascript
// The following are equivalent.
S({
	foo: string()
	bar: [number()]
});

object({
	foo: string()
	bar: array.of(number())
});

```

The rules of inference are
- Strings are fixed string values: 'foo' becomes string('foo')
- Numbers are fixed number values: 12 becomes number(12)
- Objects are dictionaries if they have one (presumably pattern) property, and are normal objects otherwise.
- Arrays are tuples if they contain multiple schemas, lists if they contain one.

So, for example, if you need an object with a single property you must call ```object``` rather than ```S```.

## references

Schemas are assigned to vars. To refer to a schema, simply reference the var.

```javascript
var id = number();
var color = or('red', 'green');

var tag = S([id, color]);
```

### reference keys

If you are using an es6 compiler (and you should be), you can use computed property names to
refer to a schema when declaring a key in an object.

```javascript
var columnID = d('columnID', 'String id for a column', string(/column[0-9]+/));

var columns = S({
	[columnID]: string()
});

```

A schema used as a key must have a title (see ```d```, below).

## strings

Strings can be declared as a fixed, regular expression, or arbitrary value.

```string('foo')```

```string(/^b[a]+r$/)```

```string()``` 

A literal string in another schema object is interpreted as a fixed string. The following
are equivalent.

```javascript
S({
	foo: string('bar')
})
```

```javascript
S({
	foo: 'bar'
})
```

## numbers

Numbers can be declared as arbitary, or having a minimum, a minimum and maximum, or a fixed value.

```number()```

```number([0])```

```number([100, 200])```

```number(12)```

A literal number is interpreted as a fixed number. The following are equivalent.

```javascript
S({
	foo: number(5)
})
```

```javascript
S({
	foo: 5
})
```

## objects

Objects in javascript are typically used in two ways: as an object with fixed properties, or as a
dictionary (with the usual caveats regarding the limitations of such use). JSON schema attempts to
handle this with "pattern keys", which are a very poor match for typical use. We seldom think of our
dictionary keys in terms of regular expressions, and we seldom have both fixed and pattern keys in
the same object. For this reason, schema-shorthand provides simple syntax for the common use cases.


```javascript

// An object with fixed properties
S({
	foo: 12,
	bar: 'baz'
});

var UUID = d(
	'UUID', 'UUID string',
	string(/[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/)
);

// A dictionary over UUIDs
S({
	[UUID]: number()
});

// A dictionary with inline pattern key
S({
	'/column[0-9]+/': string()
});

// If you must mix fixed and pattern keys, use the object() method

object({
	foo: 12,                 // fixed key
	'/^b[a]+r$/': 'baz'      // pattern key
});

// Dictionaries can also be declared with object.of or dict

object.of({
	[UUID]: number()
})

dict({
	[UUID]: number()
})
```


## arrays

Arrays in javascript are typically used in two ways: as tuples of heterogeneous values (fixed length), or as lists
of homogeneous values (variable length). For this reason, schema-shorthand provides simple syntax for the common use cases.

```javascript

// An array containing a single schema is interpreted as a list of that type.
S([number()]);

// An array containing multiple schemas is interpted as a tuple of those types.
S([string(), number([10, 20])]);

// If you require an array of length one, use the ```array``` method.

array([number()]);

// A list can also be declared with array.of

array.of([string()]);
```

## unions

```javascript
or('foo', 'bar', 'baz');

or(string(), number());
```

## other primitives

```
S({
	foo: nullval,
	bar: boolean
})
```

## Annotations

### Title and description

The ```d``` method returns a schema with associated title and description. Note this
is non-mutating: the underlying schema object is not modified.

```
var foo = d('Foo', 'A foo object', S({
	foo: string(),
	bar: number()
}))
```

### Role

A role may be declared for a schema, e.g. in the context of another schema. Currently the
html renderer only uses this for tuples.

```javascript
// A confusing schema for rectangles, represented as an array of four numbers. What does
// each value mean?
var rect = S([number(), number(), number(), number()]);

// A better schema for rectangles.
var rect = S([r('x', number()), r('y', number()), r('dx', number()), r('dy', number())]);
```

The ```r``` method is non-mutating, so you can assign roles to schemas without affecting their
definition.

```
var name = d('name', 'A name', string());

var person = S([r('first name', name), r('last name', name)]);

The ```r``` syntax is more verbose than I would like.

### Lint

Use `npm run lint` to run the lint rules. We lint with eslint and babel-eslint.

### Test

With mocha, `npm test`, and connect to the provided url.

### References
 * http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
 * http://webpack.github.io/
 * http://www.youtube.com/watch?v=VkTCL6Nqm6Y
