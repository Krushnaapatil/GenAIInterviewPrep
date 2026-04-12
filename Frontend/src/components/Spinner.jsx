import './Spinner.scss';

const Spinner = ({ size = 'medium', text = '' }) => {
    return (
        <div className={`spinner spinner--${size}`}>
            <div className='spinner__ring' />
            {text && <p className='spinner__text'>{text}</p>}
        </div>
    );
};

export default Spinner;
