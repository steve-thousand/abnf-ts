
import { Readable } from "node:stream";

/**
 * Logic for how to handle an input stream of tokens or text is contained here.
 */

/**
 * Represents a claim on a portion of the input stream. Marks a portion of the stream that
 * cannot be re-consumed until released, and exposes the ability to perform the release action.
 */
export interface TokenStreamLease {
    /**
     * Release this claim on a portion of the stream
     */
    release(): void
}

function pushStringIntoStream(string: string, stream: TokenStream): void {
    for (var i = 0; i < string.length; i++) {
        stream.push(string.charAt(i))
    }
}

class StringStreamLease implements TokenStreamLease {
    value: string
    stream: TokenStream
    constructor(value: string, stream: TokenStream) {
        this.value = value
        this.stream = stream
    }
    release(): void {
        pushStringIntoStream(this.value, this.stream)
        //TODO: better clean up?
        this.value = undefined
    }
}

/**
 * Any class that provides a possible set of information to match our token stream on.
 */
export interface TokenStreamPredicate {
    apply(stream: TokenStream): TokenStreamLease
}

export class LiteralPredicate implements TokenStreamPredicate {
    value: string
    constructor(value: string) {
        this.value = value
    }
    apply(stream: TokenStream): TokenStreamLease {
        let index = 0
        while (index < this.value.length) {
            const char = stream.read()
            if (this.value.charAt(index) != char) {
                pushStringIntoStream(this.value, stream)
                return null
            }
            index++
        }
        return new StringStreamLease(this.value, stream)
    }
}

/**
 * Any class that wraps a stream of tokens or text and exposes the ability to read them,
 * acquire potential claims on them, and release them to be re-consumed if need be.
 */
export interface TokenStream {
    consume(predicate: TokenStreamPredicate): TokenStreamLease
    read(): string
    push(char: string)
}

export class StringStream implements TokenStream {
    private string: string
    private index = 0

    constructor(string: string) {
        this.string = string
    }

    consume(predicate: TokenStreamPredicate): TokenStreamLease {
        return predicate.apply(this)
    }

    read(): string {
        if (this.index <= this.string.length - 1) {
            this.index++
            return this.string.charAt(this.index - 1)
        } else {
            return null
        }
    }

    push(char: string) {
        this.index--;
    }
}

/**
 * TODO: ???
 */
class PushbackStream {
    private readable: Readable
    private buffer: string[] = []
    read(): string {
        if (this.buffer.length > 0) {
            return this.buffer.splice(0, 1)[0]
        }
        return this.readable.read(1)
    }
    pushback(chars: string[]) {
        this.buffer = this.buffer.concat(chars)
    }
}