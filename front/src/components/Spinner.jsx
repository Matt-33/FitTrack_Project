import "./Spinner.scss";

export const Spinner = ({ size = 18 }) => (
	<span className="spinner" style={{ width: size, height: size }} />
);

export const FullScreenSpinner = () => (
	<div className="spinner-overlay">
		<span className="spinner" style={{ width: 36, height: 36 }} />
	</div>
);

export default Spinner;
