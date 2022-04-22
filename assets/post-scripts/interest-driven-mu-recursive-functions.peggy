// https://eatchangmyeong.github.io/2022/04/22/interest-driven-mu-recursive-functions.html 에 파서로 삽입한 peggy 코드입니다.

{
	class MuFunction {
		constructor(arity, fn) {
			this.arity = arity;
			this.fn = function*(arg) {
				yield;
				return yield* fn(arg);
			};
		}
		invoke(arg) {
			return new MuInvocation(this.fn(arg));
		}
	}
	class MuInvocation {
		constructor(gen) {
			this.gen = gen;
			this.result = undefined;
		}
		next() {
			if(this.result === undefined) {
				const { done, value } = this.gen.next();
				if(done && typeof value === 'bigint')
					this.result = value;
				else {
					if(done)
						this.gen = value;
					return { done: false, value: undefined };
				}
			}
			return { done: true, value: this.result };
		}
		[Symbol.iterator]() {
			return this;
		}
	}
	function predicate(arity, fn) {
		return new MuFunction(arity, function*(arg_) {
			const arg = [];
			for(const x of arg_)
				arg.push(yield* x);
			return fn(arg) ? 1n : 0n;
		});
	}

	const
		initial_defs = new Map([
			['__builtin_add', new MuFunction(2n, function*([l, r]) {
				return (yield* l) + (yield* r);
			})],
			['__builtin_sub', new MuFunction(2n, function*([l_, r_]) {
				const
					l = yield* l_,
					r = yield* r_;
				return l >= r ? l - r : 0n;
			})],
			['__builtin_pred', new MuFunction(1n, function*([x_]) {
				const x = yield* x_;
				return x == 0n ? 0n : x - 1n;
			})],
			['__builtin_mul', new MuFunction(2n, function*([l, r]) {
				return (yield* l)*(yield* r);
			})],
			['__builtin_div', new MuFunction(2n, function*([l, r_]) {
				const r = yield* r_;
				if(r == 0n)
					while(true)
						yield;
				return (yield* l)/r;
			})],
			['__builtin_exp', new MuFunction(2n, function*([l, r]) {
				return (yield* l)**(yield* r);
			})],
			['__builtin_eq', predicate(2n, ([l, r]) => l == r)],
			['__builtin_ne', predicate(2n, ([l, r]) => l != r)],
			['__builtin_lt', predicate(2n, ([l, r]) => l < r)],
			['__builtin_le', predicate(2n, ([l, r]) => l <= r)],
			['__builtin_gt', predicate(2n, ([l, r]) => l > r)],
			['__builtin_ge', predicate(2n, ([l, r]) => l >= r)],
			['__builtin_and', predicate(2n, ([l, r]) => l && r)],
			['__builtin_or', predicate(2n, ([l, r]) => l || r)],
			['__builtin_not', predicate(1n, ([x]) => !x)],
			['__builtin_if', new MuFunction(3n, function*([p, t, f]) {
				return yield* ((yield* p) ? t : f);
			})],
		]),
		C = (a, x) => new MuFunction(a, function*() {
			return x;
		}),
		S = new MuFunction(1n, function*([x]) {
			return (yield* x) + 1n;
		}),
		P = (a, i) => new MuFunction(a, function*(arg) {
			return arg[i];
		}),
		compose = (L, r) => new MuFunction(r[0].arity, function*(arg) {
			return L.invoke(r.map((X, i) => X.invoke(arg)));
		}),
		compose_nullary = (L, a) => new MuFunction(a, function*() {
			return L.invoke([]);
		}),
		rho = (F, G) => new MuFunction(
			F.arity + 1n,
			function*([first_, ...rest]) {
				const first = yield* first_;
				if(first == 0n)
					return F.invoke(rest);
				else {
					const first_dec = C(0, first - 1n).invoke();
					return G.invoke([
						first_dec,
						this.invoke([first_dec, ...rest]),
						...rest
					]);
				}
			}
		),
		mu = F => new MuFunction(F.arity - 1n, function*(arg) {
			for(let i = 0n;; i++)
				if((yield* F.invoke([C(0, i).invoke([]), ...arg])) == 0n)
					return i;
		});
	const def_map = new Map(initial_defs);
}

MuProgram
	= (Def _)* fn:Fn args:(_ int:int { return int; })* {
		if(fn.arity != BigInt(args.length))
			error('number of arguments does not match the function\'s arity');
		return fn.invoke(args.map(x => C(0, x).invoke([])));
	}

Def "function declaration"
	= ident:ident _ '=' _ fn:Fn _ ';' {
		if(def_map.has(ident))
			error(`${ident} was already defined`);
		def_map.set(ident, fn);
	}

Fn "function expression"
	= base:Atom chain:(
		_ '*' _ chain:(
			chain:Atom { return { chain: [chain] }; }
			/ '<' _ chain:FnList _ '>' { return { chain }; }
			/ '<' _ arity:int _ '>' { return { chain: [], arity }; }
		) { return chain; }
	)* {
		for(const x of chain)
			if(base.arity != 0n && 'arity' in x)
				error('*: non-nullary function cannot be nullary chained');
			else if(base.arity == 0n && !('arity' in x))
				error('*: nullary function cannot be non-nullary chained');
			else if(base.arity != BigInt(x.chain.length))
				error('*: arity mismatch between underlying functions');
			else if(base.arity == 0n)
				base = compose_nullary(base, x.arity);
			else
				base = compose(base, x.chain);
		return base;
	}

Atom "atom"
	= 'C' _ '<' _ arity:int _ ',' _ value:int _ '>' {
		return C(arity, value);
	}
	/ 'S' { return S; }
	/ 'P' _ '<' _ arity:int _ ',' _ index:int _ '>' {
		if(arity == 0n)
			error('P: a projection function cannot be nullary');
		if(index >= arity)
			error('P: return index must be less than its arity');
		return P(arity, index);
	}
	/ 'Rho' _ '<' _ base:Fn _ ',' _ iter:Fn _ '>' {
		if(base.arity + 2n != iter.arity)
			error('Rho: arity mismatch between underlying functions');
		return rho(base, iter);
	}
	/ 'Mu' _ '<' _ iter:Fn _ '>' {
		if(iter.arity == 0n)
			error('Mu: underlying function must not be nullary');
		return mu(iter);
	}
	/ ident:ident {
		if(!def_map.has(ident))
			error(`${ident} is not defined`);
		return def_map.get(ident);
	}

FnList "function list"
	= fn:Fn rest:(
		_ ',' _ next:Fn { return next; }
	)* { return [fn, ...rest]; }

ident "identifier"
	= ident:$([A-Za-z_][A-Za-z0-9_]*) ! {
		return (
			ident == 'C' ||
			ident == 'S' ||
			ident == 'P' ||
			ident == 'Mu' ||
			ident == 'Rho'
		);
	} { return ident; }

int "integer"
	= int:$[0-9]+ { return BigInt(int); }

_ "whitespace"
	= [ \t\r\n]*