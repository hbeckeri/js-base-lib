import React from 'react';

export default register => {
	return Child => {
		if (!register) {
			throw new Error('You must implement `register` to use `withData`');
		}

		if (!Child.model) {
			throw new Error('You must implement `model` to use `withData`');
		}

		return class WithData extends React.Component {
			static getInitialProps(ctx) {
				return Child.getInitialProps(ctx);
			}

			render() {
				if (!this.dataModel) {
					this.dataModel = Child.model(this.props);
				}

				const send = async (key, ...data) => {
					const mutator = register()[key];

					if (!mutator) {
						throw new Error(`Did not find any mutator function for '${key}'`);
					}

					this.dataModel = await mutator(this.dataModel, ...data);
					this.forceUpdate();
				};

				const props = {
					send,
					model: this.dataModel,
					...this.props
				};

				return <Child {...props} />;
			}
		};
	};
};
