# schema-shorthand

This is a quick experiment with writing schema in js, influenced
by js-schema.

I'm unhappy with all the schema tools that I know of. There are two simple
features I require. The tl;dr is it should look more like math.

## Schemas should be easy for humans to write.

Low-level schema documents in json, xml, etc., are great for machines, horrible
for humans. They're verbose and unwieldy. Declarations that should be a
few simple characters become many lines.

Web forms, and other GUI tools can't provide sufficient flexibilty; and
there's no good workflow that involves moving schema between a code repo and a 
GUI.

Instead, use a succinct, text-based DSL or API.

## Schemas should be easy for humans to read.

Schema documentation should look like the data, not the schema document.
A human reader should be able to grok the overall shape of the data at a glance;
drilling-in for details.


### Lint

Use `npm run lint` to run the lint rules. We lint with eslint and babel-eslint.

### Test

With mocha, `npm test`, and connect to the provided url.

### References
 * http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/
 * http://webpack.github.io/
 * http://www.youtube.com/watch?v=VkTCL6Nqm6Y
