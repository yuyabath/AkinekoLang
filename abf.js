// enum command types
class CommandType {
    constructor(num, name) {
        this.num = num;
        this.name = name;
    }
}
const inc_ptr = new CommandType(0, 'アキニウム光線！');
const dec_ptr = new CommandType(1, 'スコポンジ');
const inc_val = new CommandType(2, 'ボコォ');
const dec_val = new CommandType(3, 'グシャァ');
const begin_loop = new CommandType(4, 'はぁ〜');
const end_loop = new CommandType(5, 'ぺったんぺったん');
const std_input = new CommandType(6, 'スバラシイデス！！');
const std_output = new CommandType(7, '男の娘じゃい！');
const all_command_types = [inc_ptr, dec_ptr, inc_val, dec_val, begin_loop, end_loop, std_input, std_output];

// each command (atomic words in a source code)
class Command {
    constructor(type, jump_to=null) {
        this.type = type;
        this.jump_to = jump_to;
    }

    is(command_type) {
        return Object.is(this.type, command_type);
    }
}

// main entry
function run(){
    const doc = document.getElementById('source').value;
    document.getElementById('out').innerHTML = fuck(doc);
}

// f**k the brain
function fuck(docstr){
    // const settings
    const memory_size = 100000;
    const max_conputational_time = 1000; // unit: milliseconds
    const num_commands_to_check_time = 10000;

    // memory cells
    const cells = new Array(memory_size);
    cells.fill(0);
    let cellptr = 0;

    // other unconst values
    let output = "";
    let count_commands = 0;

    // read the source file
    let commands;
    try {
        commands = sourceToCommands(docstr);
    } catch (e) {
        // return the error message directly to the output element
        return e;
    }

    // main loop
    const start_time = Date.now();
    const cmd_size = commands.length
    for(let cmdptr = 0; cmdptr < cmd_size; cmdptr++) {
        count_commands++;
        if (count_commands % num_commands_to_check_time === 0) {
            const delta_time = Date.now() - start_time;
            if (delta_time > max_conputational_time) {
                return `RunTimeError: Computation timed out after ${max_computational_time} ms. May be infinite loop?`;
            }
            count_commands = 0;
        }

        const command = commands[cmdptr];
        if (command.is(inc_val)) {
            cells[cellptr]++;
        } else if (command.is(dec_val)) {
            cells[cellptr]--;
        } else if (command.is(inc_ptr)) {
            cellptr++;
        } else if (command.is(dec_ptr)) {
            cellptr--;
        } else if (command.is(begin_loop)) {
            if (cells[cellptr] === 0) {
                cmdptr = command.jump_to;
            }
        } else if (command.is(end_loop)) {
            if (cells[cellptr] !== 0) {
                cmdptr = command.jump_to;
            }
        } else if (command.is(std_output)) {
            output += String.fromCharCode(cells[cellptr]);
        } else if (command.is(std_input)) {
            return `Sorry, the command ${ command.type.name } is currently not supported. Thanks!`;
        }
    }

    return output;
}

// check if the parentheses (begin/end loop symbols) are valid
function checkJumpCommands(commands) {
    let c = 0;
    for (const command of commands) {
        if (command.is(begin_loop)) {
            c++;
        } else if (command.is(end_loop)) {
            c--;
        }
        if (c < 0) {
            return {'result': false, 'message': `Unexpected ${ end_loop.name }!`};
        }
    }
    if (c !== 0) {
        if (c > 0) {
            return {'result': false, 'message': `Too many ${ begin_loop.name }!`};
        } else {
            return {'result': false, 'message': `Too many ${ end_loop.name }!`};
        }
    }
    return {'result': true};
}

// find the right jump target
function jumpRight(commands, ptr){
    const cmd_size = commands.length;
    let c = 1;
    while(ptr < cmd_size && c > 0){
        ptr++;
        const command = commands[ptr];
        if (command.is(begin_loop)) {
            c++;
        }
        if (command.is(end_loop)) {
            c--;
        }
    }
    return ptr - 1;
}
// find the left jump target
function jumpLeft(commands, ptr){
    const cmd_size = commands.length;
    let c = 1;
    while(ptr < cmd_size && c > 0){
        ptr--;
        const command = commands[ptr];
        if (command.is(end_loop)) {
            c++;
        }
        if (command.is(begin_loop)) {
            c--;
        }
    }
    return ptr - 1;
}

// read the source code and convert it into a sequence of commands
function sourceToCommands(src){
    const all_names = all_command_types.map((command_type) => {return command_type.name});
    const pattern = RegExp(`(${ all_names.join('|') })`, 'g');
    const commands_in_string = src.match(pattern);
    if (commands_in_string === null) {
        return [];
    }
    function getCorrespondingCommand(name) {
        for (const command_type of all_command_types) {
            if (name === command_type.name) {
                return new Command(command_type);
            }
        }
        throw `ValueError: No such command ${ name }`;
    }
    const commands_without_jump_info = commands_in_string.map(getCorrespondingCommand);
    const check_result = checkJumpCommands(commands_without_jump_info);
    if (!check_result['result']) {
        throw `ParseError: ${ check_result['message'] }`;
    }
    const commands = addJumpInfoToCommands(commands_without_jump_info);
    return commands;
}

// pre-calculate the jump target to reduce the main computational time
function addJumpInfoToCommands(commands) {
    for (let [command_ptr, command] of commands.entries()) {
        if (command.is(begin_loop)) {
            command.jump_to = jumpRight(commands, command_ptr);
        } else if (command.is(end_loop)) {
            command.jump_to = jumpLeft(commands, command_ptr);
        }
    }
    return commands;
}

function sampleCode() {
    const code = "ボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォはぁ〜アキニウム光線！"
          + "ボコォアキニウム光線！ボコォボコォボコォアキニウム光線！ボコォボコォボコォボコォボコォボコォボコォアキニウム光線！"
          + "ボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォスコポンジスコポンジスコポンジスコポンジグシャァぺったんぺったん"
          + "アキニウム光線！アキニウム光線！アキニウム光線！グシャァグシャァグシャァグシャァグシャァ男の娘じゃい！"
          + "アキニウム光線！ボコォボコォボコォボコォボコォボコォボコォ男の娘じゃい！グシャァグシャァ男の娘じゃい！"
          + "スコポンジスコポンジボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォ男の娘じゃい！"
          + "アキニウム光線！アキニウム光線！ボコォボコォ男の娘じゃい！ボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォ男の娘じゃい！"
          + "グシャァグシャァグシャァグシャァグシャァグシャァグシャァ男の娘じゃい！スコポンジスコポンジ"
          + "グシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァ男の娘じゃい！"
          + "アキニウム光線！ボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォボコォ男の娘じゃい！"
          + "ボコォボコォ男の娘じゃい！グシャァグシャァ男の娘じゃい！グシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァグシャァ"
          + "男の娘じゃい！ボコォ男の娘じゃい！";
    document.getElementById('source').value = code;
}
