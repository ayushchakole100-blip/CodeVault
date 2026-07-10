import {
    Code2
} from "lucide-react";

import {
    useNavigate
} from "react-router-dom";

const SolveButton = ({
    problemId
}) => {
    const navigate =
        useNavigate();

    return (
        <button
            className="problem-solve-button"
            onClick={() =>
                navigate(
                    `/problems/${problemId}/solve`
                )
            }
        >
            <Code2 size={15} />

            SOLVE
        </button>
    );
};

export default SolveButton;