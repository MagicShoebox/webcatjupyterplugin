define([
    'base/js/namespace', 'require', 'base/js/events', 'base/js/dialog'
], function (
    Jupyter, requirejs, events, dialog
) {
        var prefix = 'webcat-jupyter-extension';
        var submitActionName = 'submit-to-webcat';

        function load_ipython_extension() {

            var action = {
                span: 'Submit to Web-CAT',
                help: 'Submit to Web-CAT',
                help_index: 'zz',
                handler: webcat_request
            };

            Jupyter.actions.register(action, submitActionName, prefix);
            Jupyter.toolbar.add_buttons_group([{
                'action': prefix + ':' + submitActionName,
                'label': 'Submit to Web-CAT'
            }], submitActionName)

        }

        function webcat_request() {
            var re = /^\/notebooks(.*?)$/;
            var filepath = window.location.pathname.match(re)[1];
            Jupyter.actions.call("jupyter-notebook:save-notebook");
            try {
                var cell = Jupyter.notebook.get_cell(0);
                var text = cell.get_text();
                var arr = text.split("#");
                var course = arr[2].split(":")[1].trim();
                var assignment = arr[3].split(":")[1].trim();
                var institute = arr[4].split(":")[1].trim();
            }
            catch (err) {
                alert("The first cell doesn't contain the Web-CAT assignment "
                    + "identification parameters. Make sure your first cell "
                    + "contains your assignment parameters. For example: \n\n"
                    + "# Do not edit this cell\n\n"
                    + "# course: 123\n"
                    + "# a: Assignment 1\n"
                    + "# d: VT");
                return;
            }
            var payload = {
                'filename': filepath,
                'course': course,
                'a': assignment,
                'd': institute
            };
            var settings = {
                url: '/webcat/push',
                processData: false,
                type: "PUT",
                headers: {},
                dataType: "json",
                data: JSON.stringify(payload),
                contentType: 'application/json',
                success: function (data) {
                    window.open(data.redirectLink);
                },
                error: function (data) {
                    alert("Error while submitting to Web-CAT");
                }
            };

            // https://blog.jupyter.org/security-release-jupyter-notebook-4-3-1-808e1f3bb5e2
            var xsrf_token = document.cookie.match("\\b_xsrf=([^;]*)\\b")?.[1]
            if (xsrf_token) {
                settings.headers['X-XSRFToken'] = xsrf_token
            }

            // commit and push
            $.ajax(settings);
        }

        return {
            load_ipython_extension: load_ipython_extension
        };
    });